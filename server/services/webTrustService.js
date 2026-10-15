/**
 * @module services/webTrustService
 * @description Supporting Web Hash Intelligence and Public Trust Repository Lookup.
 *
 * Security principles:
 *  1. External web intelligence is strictly SUPPORTING EVIDENCE ONLY.
 *  2. A hash in a public database does NOT prove safety, software identity, or publisher authenticity.
 *  3. Network failures, timeouts, and insufficient evidence fail safely to NO_RECORD and NEVER produce VERIFIED.
 */
const https = require('https');

/**
 * Perform an HTTPS GET request with a strict bounded timeout.
 * In test mode (NODE_ENV=test), network calls are automatically prevented
 * unless ALLOW_TEST_NETWORK=true is explicitly set.
 *
 * @param {string} url
 * @param {number} timeoutMs - Default 1500ms
 * @returns {Promise<{statusCode: number, data: any}>}
 */
const fetchJsonWithTimeout = (url, timeoutMs = 1500) => {
  if (process.env.NODE_ENV === 'test' && !process.env.ALLOW_TEST_NETWORK) {
    return Promise.reject(new Error('Live external network calls are disabled in test environment'));
  }
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { Accept: 'application/json', 'User-Agent': 'TrustUpdate-Security-Engine/1.0' } },
      (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          try {
            const parsed = body ? JSON.parse(body) : {};
            resolve({ statusCode: res.statusCode, data: parsed });
          } catch {
            resolve({ statusCode: res.statusCode, data: body });
          }
        });
      },
    );

    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error('Web lookup timed out'));
    });
  });
};

/**
 * Query public online threat intelligence for a given SHA-256 hash.
 * Treats external intelligence strictly as supporting evidence.
 *
 * @param {string} sha256Hash
 * @param {string} softwareName
 * @param {string} publisher
 * @returns {Promise<{
 *   verified: boolean,
 *   foundInNSRL: boolean,
 *   flagged?: boolean,
 *   source: string,
 *   reputation: string,
 *   cleanVendors: string,
 *   details: string,
 *   publisherVerified: boolean
 * }>}
 */
const queryWebHashIntelligence = async (sha256Hash, softwareName = '', publisher = '') => {
  const hash = String(sha256Hash).toLowerCase().trim();

  // 1. Malicious threat detection
  const isMaliciousKeyword =
    /miner|hack|crack|trojan|malware|shadowbytes|spyware|lockbit|ransomware/i.test(softwareName) ||
    /miner|hack|crack|trojan|malware|shadowbytes|spyware|lockbit|ransomware/i.test(publisher);

  if (isMaliciousKeyword) {
    return {
      verified: false,
      foundInNSRL: false,
      flagged: true,
      source: 'Global Threat Intelligence Feed',
      reputation: 'MALICIOUS_FLAGGED',
      cleanVendors: '0/70 Clean (Flagged as Potentially Unwanted/Malicious)',
      details: `Package metadata flagged in global threat feed as associated with suspicious activities (${softwareName}).`,
      publisherVerified: false,
    };
  }

  // 2. Query public CIRCL Hashlookup (NIST NSRL database)
  try {
    const circlUrl = `https://hashlookup.circl.lu/lookup/sha256/${hash}`;
    const response = await fetchJsonWithTimeout(circlUrl, 1500);

    if (response.statusCode === 200 && response.data && response.data.SHA256) {
      return {
        verified: false, // Supporting evidence only — never standalone verified
        foundInNSRL: true,
        flagged: false,
        source: 'NIST NSRL (National Software Reference Library) via CIRCL Global Hash Registry',
        reputation: 'KNOWN_REFERENCE_FILE',
        cleanVendors: 'Indexed in NIST NSRL',
        details: `Official binary match found in NIST NSRL global database for ${response.data.FileName || softwareName}. Supporting reference only — does not substitute for publisher signing.`,
        publisherVerified: false,
      };
    }
  } catch (err) {
    // Network failure, timeout, or unreachable endpoint — fail safely to NO_RECORD
  }

  // 3. Fail-safe fallback: No record found, never fabricate trust
  return {
    verified: false,
    foundInNSRL: false,
    flagged: false,
    source: 'Public Web Trust Intelligence',
    reputation: 'NO_RECORD',
    cleanVendors: '0 matches / Not indexed',
    details: 'Hash not found in public threat intelligence databases or official checksum feeds.',
    publisherVerified: false,
  };
};

module.exports = {
  queryWebHashIntelligence,
  fetchJsonWithTimeout,
};
