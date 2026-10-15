/**
 * @module controllers/verificationController
 * @description Orchestrates a full verification pipeline run.
 */
const fs = require('fs');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const { TrustedSoftware } = require('../models');
const { runIntegrityCheck } = require('../services/integrityService');
const { runAuthenticityChecks } = require('../services/authenticityService');
const { checkPriorRecord, saveVerificationRecord } = require('../services/trustHistoryService');
const { buildDecision } = require('../services/decisionEngine');

/**
 * POST /api/verify  (multipart/form-data)
 * Fields: softwareName, claimedVersion, publisher, [referenceHash]
 * Files:  file (required), signature (optional)
 */
const verify = async (req, res, next) => {
  const fileObj = req.files?.file?.[0] || req.file;
  const filePath = fileObj ? fileObj.path : null;
  const signaturePath = req.files?.signature?.[0]?.path || null;

  try {
    // ── 1. Input Validation ──────────────────────────────────────────────────
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!filePath) {
      return res.status(400).json({ error: 'A file must be uploaded for verification.' });
    }

    // Validate non-empty file (0-byte check)
    try {
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        fs.unlink(filePath, () => {});
        return res.status(400).json({ error: 'Uploaded file is empty (0 bytes). A valid binary software package is required.' });
      }
    } catch {
      // Continue if stat fails
    }

    const {
      softwareName,
      claimedVersion,
      publisher,
      referenceHash,
      publicKeyPem,
    } = req.body;

    // ── 2. Run all checks in parallel ────────────────────────────────────────
    const [integrityResult, authenticityResult, historyResult] = await Promise.allSettled([
      runIntegrityCheck({
        filePath,
        softwareName,
        publisher,
        userHash: referenceHash || null,
      }),
      runAuthenticityChecks({
        filePath,
        signaturePath,
        publicKeyPem: publicKeyPem || null,
        claimedPublisher: publisher,
        claimedVersion,
        softwareName,
      }),
      checkPriorRecord({ softwareName, claimedVersion, publisher }),
    ]);

    const buildFallback = (checkName, component) => ({
      check: checkName,
      component,
      result: 'ERROR',
      detail: 'An internal error occurred while running this check.',
    });

    let computedHash = null;
    let webVerified = false;
    let webResult = null;

    // Integrity (Component 2)
    let integrityEvidence;
    if (integrityResult.status === 'fulfilled') {
      ({ computedHash, webVerified, webResult } = integrityResult.value);
      integrityEvidence = integrityResult.value.evidenceItem;
    } else {
      integrityEvidence = buildFallback('Integrity Verification', 'Component 2');
    }

    // Authenticity (Component 3) — returns array of 3 items
    let authenticityEvidenceArr;
    if (authenticityResult.status === 'fulfilled') {
      authenticityEvidenceArr = authenticityResult.value;
    } else {
      authenticityEvidenceArr = [
        buildFallback('Authenticity (Signature)', 'Component 3'),
        buildFallback('Publisher / Trust Verification', 'Component 3'),
        buildFallback('Version / Freshness', 'Component 3'),
      ];
    }

    // Trust History (Component 4)
    let historyEvidence;
    if (historyResult.status === 'fulfilled') {
      historyEvidence = historyResult.value;
    } else {
      historyEvidence = buildFallback('Trust Management History', 'Component 4');
    }

    // Threat intelligence flagging
    if (webResult?.flagged && authenticityEvidenceArr[1]) {
      authenticityEvidenceArr[1] = {
        check: 'Publisher / Trust Verification',
        component: 'Component 3',
        result: 'UNTRUSTED_PUBLISHER',
        detail: `Publisher "${publisher}" or software metadata is flagged in global threat feeds.`,
      };
    }

    // ── 3. Aggregate via Decision Engine (Strict genuine evidence, no forgery) ─
    const evidence = [integrityEvidence, ...authenticityEvidenceArr, historyEvidence];
    const decision = buildDecision(evidence);

    // ── 4. Persist audit record ───────────────────────────────────────────────
    await saveVerificationRecord({
      softwareName,
      claimedVersion,
      publisher,
      fileHash: computedHash || 'N/A',
      result: decision.result,
      evidence: decision.evidence,
      recommendation: decision.recommendation,
      submittedBy: req.user ? req.user.username : null,
    });

    // ── 5. Clean up uploaded files ────────────────────────────────────────────
    [filePath, signaturePath].forEach((p) => {
      if (p) fs.unlink(p, () => {});
    });

    // ── 6. Return decision ────────────────────────────────────────────────────
    return res.status(200).json({
      ...decision,
      webVerified: Boolean(webVerified),
      autoRegistered: false,
      webResult: webResult || null,
    });
  } catch (err) {
    [filePath, signaturePath].forEach((p) => {
      if (p) fs.unlink(p, () => {});
    });
    return next(err);
  }
};

module.exports = { verify };
