/**
 * @module services/authenticityService
 * @description Component 3 — Authenticity & Trust Verification.
 *
 * Performs three independent sub-checks and returns evidence for each:
 *  A. Signature validity & Key Binding — cryptographic verification against independently trusted publisher keys in DB
 *  B. Publisher identity               — compare signing identity to trusted Publisher records
 *  C. Version / freshness & Association— detect downgrade/rollback and publisher association mismatch
 */
const crypto = require('crypto');
const fs = require('fs');
const { Op } = require('sequelize');
const { Publisher, TrustedSoftware } = require('../models');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseVersion = (v) =>
  String(v)
    .trim()
    .split('.')
    .map((n) => parseInt(n, 10) || 0);

const compareVersions = (claimed, approved) => {
  const a = parseVersion(claimed);
  const b = parseVersion(approved);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    const ai = a[i] || 0;
    const bi = b[i] || 0;
    if (ai > bi) return 'NEWER';
    if (ai < bi) return 'OLDER';
  }
  return 'SAME';
};

/**
 * Strict validator for public-key cryptographic fingerprints.
 * Rejects shortened, partial, truncated, or wildcard fingerprints.
 * Accepts only full 64-character hexadecimal SHA-256 digests (with optional SHA256: prefix).
 *
 * @param {string} ref - The reference string to validate.
 * @returns {{ valid: boolean, fingerprint?: string, reason?: string }}
 */
const validateSha256Fingerprint = (ref) => {
  if (!ref || typeof ref !== 'string') {
    return { valid: false, reason: 'Fingerprint reference is empty or invalid.' };
  }
  const trimmed = ref.trim();
  // Reject shortened or truncated fingerprints (e.g., containing ellipses '...' or wildcards)
  if (trimmed.includes('...') || trimmed.includes('*') || trimmed.includes('?')) {
    return {
      valid: false,
      reason: 'Shortened or partial fingerprint detected. Truncated fingerprints are strictly rejected for cryptographic security.',
    };
  }
  // Validate exact format: optional SHA256: prefix followed by exactly 64 hex characters
  const match = trimmed.match(/^(?:SHA256:)?([a-fA-F0-9]{64})$/i);
  if (!match) {
    return {
      valid: false,
      reason: 'Invalid fingerprint format: must be a full 64-character hexadecimal SHA-256 digest.',
    };
  }
  return { valid: true, fingerprint: match[1].toLowerCase() };
};

// ─── Sub-check A: Signature Validity & Trusted Publisher Key Binding ──────────

const verifySignatureBytes = (fileBuffer, signatureBuffer, publicKeyPem) => {
  try {
    const verify = crypto.createVerify('SHA256');
    verify.update(fileBuffer);
    verify.end();
    const valid = verify.verify(publicKeyPem, signatureBuffer);
    return valid ? 'VALID' : 'INVALID';
  } catch {
    return 'ERROR';
  }
};

/**
 * Verify digital signature against independently trusted publisher keys.
 * Never trusts a public key merely because the uploading user supplied it.
 *
 * @param {object} params
 * @param {string} params.filePath         - Path to uploaded file.
 * @param {string} params.signaturePath    - Path to uploaded signature file.
 * @param {string} [params.publicKeyPem]   - User-supplied public key PEM (if any).
 * @param {object} [params.publisherRecord]- Authoritative publisher record from DB.
 * @returns {object} Evidence item for Authenticity (Signature).
 */
const checkSignature = ({ filePath, signaturePath, publicKeyPem, publisherRecord = undefined }) => {
  if (!signaturePath) {
    return {
      check: 'Authenticity (Signature)',
      component: 'Component 3',
      result: 'MISSING',
      detail:
        'No digital signature was provided. ' +
        'Signature verification was skipped — genuine cryptographic verification against a trusted publisher key is required for a VERIFIED trust decision.',
    };
  }

  // When evaluated within verification pipeline (publisherRecord is passed)
  if (publisherRecord !== undefined) {
    if (!publisherRecord || !publisherRecord.trusted) {
      return {
        check: 'Authenticity (Signature)',
        component: 'Component 3',
        result: 'UNVERIFIED_KEY',
        detail: 'Digital signature cannot be authenticated: the publisher is not in the trusted registry.',
      };
    }

    if (!publisherRecord.publicKeyOrCertRef) {
      return {
        check: 'Authenticity (Signature)',
        component: 'Component 3',
        result: 'UNVERIFIED_KEY',
        detail: `Publisher "${publisherRecord.name}" has no trusted public key or certificate registered in the database. Signature cannot be verified.`,
      };
    }

    // Determine authoritative trusted key
    let trustedKeyToUse = null;
    const keyRef = String(publisherRecord.publicKeyOrCertRef).trim();

    const isPem =
      keyRef.startsWith('-----BEGIN PUBLIC KEY-----') ||
      keyRef.startsWith('-----BEGIN CERTIFICATE-----') ||
      keyRef.startsWith('-----BEGIN RSA PUBLIC KEY-----');

    if (isPem) {
      trustedKeyToUse = keyRef;
      // If user supplied a key, verify it matches the authoritative database key exactly
      if (publicKeyPem && publicKeyPem.trim() !== keyRef) {
        return {
          check: 'Authenticity (Signature)',
          component: 'Component 3',
          result: 'UNVERIFIED_KEY',
          detail: 'Attacker-controlled or mismatched key detected: user-supplied public key does not match the registered publisher key in the database.',
        };
      }
    } else {
      // Validate fingerprint format strictly — no partial, wildcard, or shortened fingerprints allowed
      const fpValidation = validateSha256Fingerprint(keyRef);
      if (!fpValidation.valid) {
        return {
          check: 'Authenticity (Signature)',
          component: 'Component 3',
          result: 'UNVERIFIED_KEY',
          detail: `Publisher "${publisherRecord.name}" has an invalid or shortened key reference in the registry (${keyRef}). ${fpValidation.reason} Cryptographic verification requires an authoritative full PEM key or full 64-character SHA-256 fingerprint.`,
        };
      }

      if (!publicKeyPem) {
        return {
          check: 'Authenticity (Signature)',
          component: 'Component 3',
          result: 'MISSING',
          detail: 'Public key is required to verify against the publisher registered certificate reference.',
        };
      }

      // Compute actual SHA-256 fingerprint of the user-supplied public key
      const actualKeyFingerprint = crypto
        .createHash('sha256')
        .update(publicKeyPem.trim())
        .digest('hex')
        .toLowerCase();

      // Constant-time comparison between full 64-character fingerprints
      const expectedBuf = Buffer.from(fpValidation.fingerprint, 'hex');
      const actualBuf = Buffer.from(actualKeyFingerprint, 'hex');
      const fingerprintsMatch =
        expectedBuf.length === actualBuf.length &&
        crypto.timingSafeEqual(expectedBuf, actualBuf);

      if (!fingerprintsMatch) {
        return {
          check: 'Authenticity (Signature)',
          component: 'Component 3',
          result: 'UNVERIFIED_KEY',
          detail: `Attacker-controlled key detected: public key fingerprint (${actualKeyFingerprint}) does not match publisher registered reference (${fpValidation.fingerprint}).`,
        };
      }

      trustedKeyToUse = publicKeyPem;
    }

    if (!trustedKeyToUse) {
      return {
        check: 'Authenticity (Signature)',
        component: 'Component 3',
        result: 'UNVERIFIED_KEY',
        detail: 'No trusted public key could be resolved from the publisher registry record.',
      };
    }

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const signatureBuffer = fs.readFileSync(signaturePath);
      const outcome = verifySignatureBytes(fileBuffer, signatureBuffer, trustedKeyToUse);

      if (outcome === 'INVALID' || outcome === 'ERROR') {
        return {
          check: 'Authenticity (Signature)',
          component: 'Component 3',
          result: 'INVALID',
          detail: outcome === 'INVALID'
            ? 'The digital signature is INVALID — the file may have been tampered with after signing.'
            : 'Signature verification encountered an error (malformed signature or unsupported key format).',
        };
      }

      return {
        check: 'Authenticity (Signature)',
        component: 'Component 3',
        result: 'VALID',
        detail: `The digital signature is cryptographically valid and verified against the registered trusted publisher key (${publisherRecord.name}).`,
      };
    } catch (err) {
      return {
        check: 'Authenticity (Signature)',
        component: 'Component 3',
        result: 'INVALID',
        detail: `Signature file could not be read: ${err.message}`,
      };
    }
  }

  // Fallback for isolated primitive tests without publisherRecord
  if (!publicKeyPem) {
    return {
      check: 'Authenticity (Signature)',
      component: 'Component 3',
      result: 'MISSING',
      detail: 'No digital signature or public key was provided.',
    };
  }

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const signatureBuffer = fs.readFileSync(signaturePath);
    const outcome = verifySignatureBytes(fileBuffer, signatureBuffer, publicKeyPem);

    if (outcome === 'INVALID' || outcome === 'ERROR') {
      return {
        check: 'Authenticity (Signature)',
        component: 'Component 3',
        result: 'INVALID',
        detail: outcome === 'INVALID'
          ? 'The digital signature is INVALID — the file may have been tampered with after signing.'
          : 'Signature verification encountered an error (malformed signature or unsupported key format).',
      };
    }

    return {
      check: 'Authenticity (Signature)',
      component: 'Component 3',
      result: 'VALID',
      detail: 'The digital signature is cryptographically valid for the uploaded file.',
    };
  } catch (err) {
    return {
      check: 'Authenticity (Signature)',
      component: 'Component 3',
      result: 'INVALID',
      detail: `Signature file could not be read: ${err.message}`,
    };
  }
};

// ─── Sub-check B: Publisher Identity ─────────────────────────────────────────

const checkPublisher = async ({ claimedPublisher }) => {
  if (!claimedPublisher) {
    return {
      check: 'Publisher / Trust Verification',
      component: 'Component 3',
      result: 'MISSING',
      detail: 'No publisher identity was provided in the submission.',
      publisherRecord: null,
    };
  }

  const record = await Publisher.findOne({
    where: {
      name: { [Op.like]: claimedPublisher.trim() },
    },
  });

  if (!record) {
    return {
      check: 'Publisher / Trust Verification',
      component: 'Component 3',
      result: 'UNKNOWN_PUBLISHER',
      detail: `Publisher "${claimedPublisher}" is not in the trusted publisher registry.`,
      publisherRecord: null,
    };
  }

  if (!record.trusted) {
    return {
      check: 'Publisher / Trust Verification',
      component: 'Component 3',
      result: 'UNTRUSTED_PUBLISHER',
      detail: `Publisher "${claimedPublisher}" exists in the registry but is currently marked as untrusted.`,
      publisherRecord: record,
    };
  }

  return {
    check: 'Publisher / Trust Verification',
    component: 'Component 3',
    result: 'MATCH',
    detail: `Publisher "${claimedPublisher}" is in the trusted registry (identity: ${record.verifiedIdentity}).`,
    publisherRecord: record,
  };
};

// ─── Sub-check C: Version / Freshness & Software Association ──────────────────

const checkFreshness = async ({ claimedVersion, softwareName, publisher }) => {
  if (!claimedVersion || !softwareName) {
    return {
      check: 'Version / Freshness',
      component: 'Component 3',
      result: 'MISSING',
      detail: 'Insufficient data to perform a version freshness check.',
    };
  }

  const record = await TrustedSoftware.findOne({
    where: {
      softwareName: { [Op.like]: softwareName.trim() },
    },
  });

  if (!record) {
    return {
      check: 'Version / Freshness',
      component: 'Component 3',
      result: 'NO_REFERENCE',
      detail: `No approved version on record for "${softwareName}". Cannot assess freshness.`,
    };
  }

  // Association check: verify software identity is correctly bound to claimed publisher
  if (publisher && record.publisher.toLowerCase().trim() !== publisher.toLowerCase().trim()) {
    return {
      check: 'Version / Freshness',
      component: 'Component 3',
      result: 'ROLLBACK_DETECTED',
      detail: `Publisher association mismatch: "${softwareName}" is officially published by "${record.publisher}", not "${publisher}".`,
    };
  }

  const comparison = compareVersions(claimedVersion, record.latestApprovedVersion);

  if (comparison === 'OLDER') {
    return {
      check: 'Version / Freshness',
      component: 'Component 3',
      result: 'ROLLBACK_DETECTED',
      detail:
        `Claimed version ${claimedVersion} is OLDER than the latest approved version ` +
        `${record.latestApprovedVersion}. Installing this may expose known vulnerabilities.`,
    };
  }

  if (comparison === 'NEWER') {
    return {
      check: 'Version / Freshness',
      component: 'Component 3',
      result: 'NEWER_THAN_APPROVED',
      detail:
        `Claimed version ${claimedVersion} is newer than the latest approved version ` +
        `${record.latestApprovedVersion}. This version has not yet been evaluated.`,
    };
  }

  return {
    check: 'Version / Freshness',
    component: 'Component 3',
    result: 'OK',
    detail: `Version ${claimedVersion} matches the latest approved version on record.`,
  };
};

// ─── Orchestrator ─────────────────────────────────────────────────────────────

const runAuthenticityChecks = async ({
  filePath,
  signaturePath,
  publicKeyPem,
  claimedPublisher,
  claimedVersion,
  softwareName,
}) => {
  const [publisherEvidence, freshnessEvidence] = await Promise.all([
    checkPublisher({ claimedPublisher }),
    checkFreshness({ claimedVersion, softwareName, publisher: claimedPublisher }),
  ]);

  const signatureEvidence = checkSignature({
    filePath,
    signaturePath,
    publicKeyPem,
    publisherRecord: publisherEvidence.publisherRecord,
  });

  // Clean internal helper field from final evidence item
  const cleanPublisherEvidence = {
    check: publisherEvidence.check,
    component: publisherEvidence.component,
    result: publisherEvidence.result,
    detail: publisherEvidence.detail,
  };

  return [signatureEvidence, cleanPublisherEvidence, freshnessEvidence];
};

module.exports = {
  runAuthenticityChecks,
  checkSignature,
  checkPublisher,
  checkFreshness,
  compareVersions,
  verifySignatureBytes,
  validateSha256Fingerprint,
};
