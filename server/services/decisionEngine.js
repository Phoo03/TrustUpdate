/**
 * @module services/decisionEngine
 * @description Explainable Decision Engine — rule-based verdict aggregation.
 *
 * Applies deterministic rules (in strict priority order) over the evidence
 * array produced by the four checks to return one of four possible verdicts:
 *
 *   VERIFIED   — every required check genuinely passes against independently trusted reference evidence.
 *   UNTRUSTED  — a required check fails outright (hash mismatch, bad signature, rollback, untrusted publisher).
 *   SUSPICIOUS — checks partially disagree, user-supplied hash only, unverified key, missing signature, or unapproved version.
 *   UNKNOWN    — insufficient trusted reference to evaluate the software package.
 *
 * IMPORTANT: UNKNOWN is NEVER synonymous with UNTRUSTED. A software title
 * with no reference record is simply unknown — not malicious.
 *
 * The engine never returns a bare boolean or numeric score.
 * Every response carries the full evidence array.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const VERDICTS = Object.freeze({
  VERIFIED: 'VERIFIED',
  SUSPICIOUS: 'SUSPICIOUS',
  UNTRUSTED: 'UNTRUSTED',
  UNKNOWN: 'UNKNOWN',
});

// Evidence result tokens that indicate a hard failure
const HARD_FAIL_TOKENS = new Set(['MISMATCH', 'INVALID', 'ROLLBACK_DETECTED', 'UNTRUSTED_PUBLISHER']);

// Evidence result tokens that indicate no authoritative reference data is available
const ALL_NO_REF_TOKENS = new Set(['NO_REFERENCE', 'NO_PRIOR_RECORD', 'MISSING', 'UNKNOWN_PUBLISHER']);

// Evidence result tokens that indicate a successful check
const PASS_TOKENS = new Set(['MATCH', 'VALID', 'OK', 'PRIOR_RECORD', 'NO_PRIOR_RECORD']);

// ─── Plain-Language Recommendations ──────────────────────────────────────────

const RECOMMENDATIONS = {
  [VERDICTS.VERIFIED]:
    'All available checks have passed. The file integrity, digital signature, publisher identity, ' +
    'and version are consistent with trusted records. You may proceed with the installation, ' +
    'but always follow your organisation\'s change management process.',

  [VERDICTS.UNTRUSTED]:
    'One or more critical checks have FAILED. Do NOT install this update. ' +
    'The file may have been tampered with, the signature is invalid, a version rollback was detected, ' +
    'or the publisher is untrusted. Report this to your security team immediately.',

  [VERDICTS.SUSPICIOUS]:
    'Some checks passed, but others returned inconclusive or unverified results. ' +
    'Exercise caution — do not install until a security administrator has reviewed the evidence below. ' +
    'This may indicate an unverified signing key, missing signature, or an unreviewed new version.',

  [VERDICTS.UNKNOWN]:
    'There is insufficient trusted reference information to evaluate this update. ' +
    'This is NOT a security failure — the software simply has no prior record in the trust registry. ' +
    'An administrator should review and register this software before it is approved for installation.',
};

// ─── Rule Engine ─────────────────────────────────────────────────────────────

/**
 * Extract result tokens from the evidence array, keyed by check name.
 *
 * @param {object[]} evidence
 * @returns {Map<string, string>} check name → result token
 */
const buildTokenMap = (evidence) => {
  const map = new Map();
  evidence.forEach(({ check, result }) => map.set(check, result));
  return map;
};

/**
 * Aggregate a full evidence array into a final verdict.
 *
 * Rules applied in strict priority order (first match wins):
 *
 *  1. UNTRUSTED  — any hard-fail token present (tampered file, invalid signature, rollback, untrusted publisher).
 *  2. UNKNOWN    — completely unindexed software with no authoritative baseline (all checks are no-reference).
 *  3. SUSPICIOUS — partial matches, user-supplied hash without registry baseline, unverified key, missing signature, newer unapproved version, or unindexed publisher.
 *  4. VERIFIED   — all required checks genuinely pass against authoritative trusted reference evidence (including first-time submissions with NO_PRIOR_RECORD).
 *  5. SUSPICIOUS — fail-safe fallback for any unclassified state.
 *
 * @param {object[]} evidence - Array of evidence items from all four checks.
 * @returns {string} Verdict token.
 */
const computeVerdict = (evidence) => {
  const tokens = evidence.map((e) => e.result);

  // Rule 1: any hard failure → UNTRUSTED
  if (tokens.some((t) => HARD_FAIL_TOKENS.has(t))) {
    return VERDICTS.UNTRUSTED;
  }

  // Inspect integrity evidence for independent authority
  const integrityItem = evidence.find((e) => e.check === 'Integrity Verification');
  const isNonAuthoritativeIntegrity = Boolean(
    integrityItem &&
    (integrityItem.referenceSource === 'user-supplied' ||
     integrityItem.referenceSource === 'external-nsrl' ||
     integrityItem.isTrustedReference === false)
  );

  // Rule 2: Completely unindexed/unknown software → UNKNOWN
  const allNoRef = tokens.every((t) => ALL_NO_REF_TOKENS.has(t));
  if (allNoRef) {
    return VERDICTS.UNKNOWN;
  }

  // If software has no integrity reference and publisher is unknown, it is UNKNOWN
  const integrityResult = integrityItem ? integrityItem.result : 'NO_REFERENCE';
  if (integrityResult === 'NO_REFERENCE' && tokens.includes('UNKNOWN_PUBLISHER')) {
    return VERDICTS.UNKNOWN;
  }

  // Rule 3: Checks with user-supplied hash or non-authoritative source cannot exceed SUSPICIOUS
  if (isNonAuthoritativeIntegrity) {
    return VERDICTS.SUSPICIOUS;
  }

  // Special cases for partial trust or unreviewed state
  if (tokens.some((t) => t === 'UNVERIFIED_KEY' || t === 'NEWER_THAN_APPROVED' || t === 'UNKNOWN_PUBLISHER')) {
    return VERDICTS.SUSPICIOUS;
  }

  // If any critical check returned NO_REFERENCE or MISSING (e.g. missing signature or missing version reference)
  if (tokens.some((t) => t === 'NO_REFERENCE' || t === 'MISSING')) {
    return VERDICTS.SUSPICIOUS;
  }

  // Rule 4: All pass tokens against trusted authoritative evidence → VERIFIED
  // Correctly handles software with no prior verification history (NO_PRIOR_RECORD is allowed)
  const sigItem = evidence.find((e) => e.check === 'Authenticity (Signature)');
  const pubItem = evidence.find((e) => e.check === 'Publisher / Trust Verification');
  const freshItem = evidence.find((e) => e.check === 'Version / Freshness');

  const hasAuthoritativeIntegrity = Boolean(
    integrityItem &&
    integrityItem.result === 'MATCH' &&
    !isNonAuthoritativeIntegrity
  );
  const hasValidSignature = sigItem && sigItem.result === 'VALID';
  const hasMatchedPublisher = pubItem && pubItem.result === 'MATCH';
  const hasApprovedVersion = freshItem && freshItem.result === 'OK';

  if (hasAuthoritativeIntegrity && hasValidSignature && hasMatchedPublisher && hasApprovedVersion) {
    return VERDICTS.VERIFIED;
  }

  // Rule 5: Fail-safe fallback
  return VERDICTS.SUSPICIOUS;
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Build the complete Decision Engine response object.
 *
 * @param {object[]} evidence - Array of evidence items from all four components.
 * @returns {{
 *   result: string,
 *   evidence: object[],
 *   recommendation: string,
 *   timestamp: string
 * }}
 */
const buildDecision = (evidence) => {
  if (!Array.isArray(evidence) || evidence.length === 0) {
    throw new Error('decisionEngine.buildDecision: evidence array must not be empty.');
  }

  const result = computeVerdict(evidence);

  return {
    result,
    evidence,
    recommendation: RECOMMENDATIONS[result],
    timestamp: new Date().toISOString(),
  };
};

module.exports = { buildDecision, computeVerdict, VERDICTS, RECOMMENDATIONS };
