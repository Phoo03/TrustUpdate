/**
 * @module services/integrityService
 * @description Component 2 — Integrity Verification.
 *
 * Computes the SHA-256 hash of the uploaded file and compares it
 * against the trusted reference hash stored in the TrustedSoftware
 * registry. Returns raw evidence only — never a verdict.
 */
const crypto = require('crypto');
const fs = require('fs');
const { Op } = require('sequelize');
const { TrustedSoftware } = require('../models');
const { queryWebHashIntelligence } = require('./webTrustService');

/**
 * Compute the SHA-256 hash of a file at `filePath` by streaming it.
 * @param {string} filePath - Absolute path to the uploaded file.
 * @returns {Promise<string>} Hex-encoded SHA-256 digest.
 */
const computeFileHash = (filePath) =>
  new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('error', (err) => reject(new Error(`Cannot read file for hashing: ${err.message}`)));
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });

/**
 * Run the integrity check for a given software submission.
 *
 * Strict Security Lookup Order:
 *  1. Authoritative Local Registry: Look for TrustedSoftware matching softwareName + publisher.
 *     If found, its referenceHash is the ONLY authoritative basis. User-supplied hashes cannot override it.
 *  2. Public Web Trust Intelligence: If not in local registry, check CIRCL / NIST NSRL (supporting only).
 *  3. User-supplied reference hash: Only consulted when NO registry baseline exists.
 *     Treated strictly as unverified self-assertion (cannot produce a VERIFIED verdict).
 *
 * @param {object} params
 * @param {string} params.filePath      - Path to the uploaded file on disk.
 * @param {string} params.softwareName  - Claimed software name from the form.
 * @param {string} params.publisher     - Claimed publisher from the form.
 * @param {string} [params.userHash]    - Optional reference hash provided by the user.
 * @returns {Promise<{computedHash, referenceSource, isTrustedReference, evidenceItem, webResult}>}
 */
const runIntegrityCheck = async ({ filePath, softwareName, publisher, userHash }) => {
  // Step 1: compute the file's actual SHA-256 hash
  const computedHash = await computeFileHash(filePath);

  let referenceHash = null;
  let referenceSource = null;
  let isTrustedReference = false;

  // Step 2: Authoritative Local Registry lookup FIRST
  if (softwareName && publisher) {
    const record = await TrustedSoftware.findOne({
      where: {
        softwareName: { [Op.like]: softwareName.trim() },
        publisher: { [Op.like]: publisher.trim() },
      },
    });

    if (record && record.referenceHash) {
      referenceHash = record.referenceHash.trim();
      referenceSource = 'registry';
      isTrustedReference = true;
    }
  }

  // Step 3: If not in local registry, query authentic Web Trust Intelligence (supporting only)
  let webResult = null;
  if (!referenceHash && softwareName && publisher) {
    try {
      webResult = await queryWebHashIntelligence(computedHash, softwareName, publisher);
      if (webResult && webResult.foundInNSRL) {
        referenceHash = computedHash;
        referenceSource = 'external-nsrl';
        isTrustedReference = false; // Supporting evidence only — not an authoritative registry reference
      }
    } catch {
      // Ignore network errors and continue safely
    }
  }

  // Step 4: If no authoritative registry baseline exists, check user-supplied reference hash
  if (!referenceHash && userHash) {
    referenceHash = String(userHash).trim();
    referenceSource = 'user-supplied';
    isTrustedReference = false;
  }

  // Step 5: Evaluate evidence
  let evidenceResult;
  let detail;

  if (webResult && webResult.flagged) {
    evidenceResult = 'MISMATCH';
    detail =
      `CRITICAL ALERT: Package flagged by ${webResult.source}. ` +
      `${webResult.details} Reputation: ${webResult.reputation}`;
  } else if (!referenceHash) {
    evidenceResult = 'NO_REFERENCE';
    detail =
      'No trusted reference hash is on record in local registry or public threat feeds. ' +
      'Integrity comparison could not be performed.';
  } else if (computedHash.toLowerCase() === referenceHash.toLowerCase()) {
    evidenceResult = 'MATCH';
    if (referenceSource === 'user-supplied') {
      detail =
        `File hash matches user-supplied reference hash (${computedHash.substring(0, 16)}...). ` +
        `NOTE: This is not an independently verified authority baseline.`;
    } else if (referenceSource === 'external-nsrl') {
      detail =
        `File hash found in NIST NSRL reference database. ` +
        `NOTE: Public database index match only — does not establish enterprise approval.`;
    } else {
      detail =
        `File hash matches the authoritative ${referenceSource} reference hash. ` +
        `SHA-256: ${computedHash}`;
    }
  } else {
    evidenceResult = 'MISMATCH';
    detail =
      `File hash does NOT match the ${referenceSource} reference. ` +
      `Computed: ${computedHash} | Expected: ${referenceHash.toLowerCase()}`;
  }

  return {
    computedHash,
    referenceSource,
    isTrustedReference,
    webResult,
    evidenceItem: {
      check: 'Integrity Verification',
      component: 'Component 2',
      result: evidenceResult,
      detail,
      referenceSource,
      isTrustedReference,
    },
  };
};

module.exports = { computeFileHash, runIntegrityCheck };
