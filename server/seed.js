/**
 * seed.js — Populate the TrustUpdate MySQL database with realistic sample data.
 *
 * Run:  node seed.js
 *
 * Populates:
 *  - 2 User accounts (configured via .env or generated securely on run)
 *  - 9 Publishers (Google, Microsoft, Mozilla, VideoLAN, Python, 7-Zip, Canonical, ShadowBytes, LockBit)
 *  - 11 TrustedSoftware catalog entries
 *  - 15 VerificationRecords showcasing VERIFIED, UNTRUSTED, SUSPICIOUS, UNKNOWN verdicts
 */
require('dotenv').config();
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const { sequelize, User, Publisher, TrustedSoftware, VerificationRecord } = require('./models');

const publishers = [
  { name: 'Google LLC', verifiedIdentity: 'CN=Google LLC, O=Google LLC, L=Mountain View, S=California, C=US', publicKeyOrCertRef: 'SHA256:d8a2...google-release-key', trusted: true },
  { name: 'Mozilla Foundation', verifiedIdentity: 'CN=Mozilla Corporation, O=Mozilla Foundation, L=Mountain View, S=California, C=US', publicKeyOrCertRef: 'SHA256:3a91...mozilla-code-signing', trusted: true },
  { name: 'Microsoft Corporation', verifiedIdentity: 'CN=Microsoft Windows, O=Microsoft Corporation, L=Redmond, S=Washington, C=US', publicKeyOrCertRef: 'SHA256:5b8e...msft-production-pca', trusted: true },
  { name: 'VideoLAN', verifiedIdentity: 'CN=VideoLAN, O=VideoLAN Organization, L=Paris, C=FR', publicKeyOrCertRef: 'SHA256:f12e...videolan-release-key', trusted: true },
  { name: 'Python Software Foundation', verifiedIdentity: 'CN=Python Software Foundation, O=Python Software Foundation, L=Beaverton, S=Oregon, C=US', publicKeyOrCertRef: 'SHA256:7d8a...psf-release-key', trusted: true },
  { name: 'Igor Pavlov', verifiedIdentity: 'CN=Igor Pavlov, O=7-Zip, C=RU', publicKeyOrCertRef: 'SHA256:2c4b...7zip-release-cert', trusted: true },
  { name: 'Canonical Ltd.', verifiedIdentity: 'CN=Canonical Ltd., O=Canonical Ltd., L=London, C=GB', publicKeyOrCertRef: 'SHA256:9e1a...canonical-archive-key', trusted: true },
  { name: 'ShadowBytes LLC', verifiedIdentity: 'CN=ShadowBytes LLC, O=ShadowBytes LLC (Blacklisted)', publicKeyOrCertRef: null, trusted: false },
  { name: 'LockBit Cyber Gang', verifiedIdentity: 'CN=LockBit Ransomware Syndicate (Global Threat Feed Alert)', publicKeyOrCertRef: null, trusted: false },
];

const trustedSoftware = [
  { softwareName: 'Google Chrome', publisher: 'Google LLC', latestApprovedVersion: '126.0.6478.127', referenceHash: '7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730', trustStatus: 'TRUSTED' },
  { softwareName: 'Mozilla Firefox', publisher: 'Mozilla Foundation', latestApprovedVersion: '127.0.1', referenceHash: 'a'.repeat(64), trustStatus: 'TRUSTED' },
  { softwareName: 'Visual Studio Code', publisher: 'Microsoft Corporation', latestApprovedVersion: '1.91.0', referenceHash: 'b'.repeat(64), trustStatus: 'TRUSTED' },
  { softwareName: 'VLC Media Player', publisher: 'VideoLAN', latestApprovedVersion: '3.0.21', referenceHash: '3021'.repeat(16), trustStatus: 'TRUSTED' },
  { softwareName: 'Python', publisher: 'Python Software Foundation', latestApprovedVersion: '3.12.4', referenceHash: '3124'.repeat(16), trustStatus: 'TRUSTED' },
  { softwareName: '7-Zip', publisher: 'Igor Pavlov', latestApprovedVersion: '24.07', referenceHash: '2407'.repeat(16), trustStatus: 'TRUSTED' },
  { softwareName: 'Ubuntu Desktop', publisher: 'Canonical Ltd.', latestApprovedVersion: '24.04', referenceHash: 'c'.repeat(64), trustStatus: 'TRUSTED' },
  { softwareName: 'Windows Terminal', publisher: 'Microsoft Corporation', latestApprovedVersion: '1.20.11781.0', referenceHash: 'd'.repeat(64), trustStatus: 'TRUSTED' },
  { softwareName: 'CryptoMiner Pro', publisher: 'ShadowBytes LLC', latestApprovedVersion: '3.1.0', referenceHash: null, trustStatus: 'FLAGGED' },
  { softwareName: 'WannaDecryptor Pro', publisher: 'LockBit Cyber Gang', latestApprovedVersion: '2.0.0', referenceHash: null, trustStatus: 'FLAGGED' },
  { softwareName: 'LibreOffice', publisher: 'The Document Foundation', latestApprovedVersion: '24.2.4', referenceHash: 'e'.repeat(64), trustStatus: 'UNDER_REVIEW' },
];

const now = new Date();
const daysAgo = (n) => new Date(now - n * 86400000);

const verificationRecords = [
  // ── 1. VERIFIED EXAMPLES ───────────────────────────────────────────────────
  {
    softwareName: 'Google Chrome', claimedVersion: '126.0.6478.127', publisher: 'Google LLC',
    fileHash: '7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730', result: 'VERIFIED',
    evidence: [
      { check: 'Integrity Verification', component: 'Component 2', result: 'MATCH', detail: 'SHA-256 matches official Google repository hash.' },
      { check: 'Authenticity (Signature)', component: 'Component 3', result: 'VALID', detail: 'Digital signature cryptographically valid.' },
      { check: 'Publisher / Trust Verification', component: 'Component 3', result: 'MATCH', detail: 'Publisher Google LLC in trusted registry.' },
      { check: 'Version / Freshness', component: 'Component 3', result: 'OK', detail: 'Matches latest approved release 126.0.6478.127.' },
      { check: 'Trust Management History', component: 'Component 4', result: 'PRIOR_RECORD', detail: 'Historical ledger confirms 48 previous clean verifications.' },
    ],
    recommendation: 'All 5 security controls passed. Safe to deploy across corporate workstations.', submittedBy: 'admin', timestamp: daysAgo(1),
  },
  {
    softwareName: 'VLC Media Player', claimedVersion: '3.0.21', publisher: 'VideoLAN',
    fileHash: '3021'.repeat(16), result: 'VERIFIED',
    evidence: [
      { check: 'Integrity Verification', component: 'Component 2', result: 'MATCH', detail: 'Hash matches VideoLAN official release checksum.' },
      { check: 'Authenticity (Signature)', component: 'Component 3', result: 'VALID', detail: 'GPG detached signature verified against VideoLAN key.' },
      { check: 'Publisher / Trust Verification', component: 'Component 3', result: 'MATCH', detail: 'Publisher VideoLAN is registered as trusted.' },
      { check: 'Version / Freshness', component: 'Component 3', result: 'OK', detail: 'Latest approved version.' },
      { check: 'Trust Management History', component: 'Component 4', result: 'PRIOR_RECORD', detail: 'Clean audit history.' },
    ],
    recommendation: 'All integrity and authenticity checks passed. Software is certified safe.', submittedBy: 'admin', timestamp: daysAgo(2),
  },
  {
    softwareName: 'Mozilla Firefox', claimedVersion: '127.0.1', publisher: 'Mozilla Foundation',
    fileHash: 'a'.repeat(64), result: 'VERIFIED',
    evidence: [
      { check: 'Integrity Verification', component: 'Component 2', result: 'MATCH', detail: 'SHA-256 matches registry hash.' },
      { check: 'Authenticity (Signature)', component: 'Component 3', result: 'VALID', detail: 'Signature valid.' },
      { check: 'Publisher / Trust Verification', component: 'Component 3', result: 'MATCH', detail: 'Publisher in registry.' },
      { check: 'Version / Freshness', component: 'Component 3', result: 'OK', detail: 'Latest approved version.' },
      { check: 'Trust Management History', component: 'Component 4', result: 'PRIOR_RECORD', detail: 'Previously verified.' },
    ],
    recommendation: 'All checks passed. Safe to install.', submittedBy: 'admin', timestamp: daysAgo(3),
  },
  {
    softwareName: 'Visual Studio Code', claimedVersion: '1.91.0', publisher: 'Microsoft Corporation',
    fileHash: 'b'.repeat(64), result: 'VERIFIED',
    evidence: [
      { check: 'Integrity Verification', component: 'Component 2', result: 'MATCH', detail: 'SHA-256 matches Microsoft Code catalog.' },
      { check: 'Authenticity (Signature)', component: 'Component 3', result: 'VALID', detail: 'Microsoft Corporation Authenticode signature valid.' },
      { check: 'Publisher / Trust Verification', component: 'Component 3', result: 'MATCH', detail: 'Trusted publisher in registry.' },
      { check: 'Version / Freshness', component: 'Component 3', result: 'OK', detail: 'Matches latest approved version 1.91.0.' },
      { check: 'Trust Management History', component: 'Component 4', result: 'PRIOR_RECORD', detail: 'Multiple prior verified records exist.' },
    ],
    recommendation: 'Developer environment package certified. Safe to distribute.', submittedBy: 'viewer', timestamp: daysAgo(4),
  },
  {
    softwareName: 'Python', claimedVersion: '3.12.4', publisher: 'Python Software Foundation',
    fileHash: '3124'.repeat(16), result: 'VERIFIED',
    evidence: [
      { check: 'Integrity Verification', component: 'Component 2', result: 'MATCH', detail: 'Hash matches python.org official release ledger.' },
      { check: 'Authenticity (Signature)', component: 'Component 3', result: 'VALID', detail: 'Cryptographic signature attested.' },
      { check: 'Publisher / Trust Verification', component: 'Component 3', result: 'MATCH', detail: 'PSF is in trusted registry.' },
      { check: 'Version / Freshness', component: 'Component 3', result: 'OK', detail: 'Latest approved version.' },
      { check: 'Trust Management History', component: 'Component 4', result: 'PRIOR_RECORD', detail: 'Verified prior record found.' },
    ],
    recommendation: 'Package integrity verified. Approved for deployment.', submittedBy: 'admin', timestamp: daysAgo(5),
  },
  {
    softwareName: '7-Zip', claimedVersion: '24.07', publisher: 'Igor Pavlov',
    fileHash: '2407'.repeat(16), result: 'VERIFIED',
    evidence: [
      { check: 'Integrity Verification', component: 'Component 2', result: 'MATCH', detail: 'Hash matches 7-zip.org catalog.' },
      { check: 'Authenticity (Signature)', component: 'Component 3', result: 'VALID', detail: 'Digital certificate valid.' },
      { check: 'Publisher / Trust Verification', component: 'Component 3', result: 'MATCH', detail: 'Publisher recognized and trusted.' },
      { check: 'Version / Freshness', component: 'Component 3', result: 'OK', detail: 'Latest approved version 24.07.' },
      { check: 'Trust Management History', component: 'Component 4', result: 'PRIOR_RECORD', detail: 'Prior record exists.' },
    ],
    recommendation: 'Safe utility binary. Verification passed.', submittedBy: 'viewer', timestamp: daysAgo(6),
  },
  {
    softwareName: 'Windows Terminal', claimedVersion: '1.20.11781.0', publisher: 'Microsoft Corporation',
    fileHash: 'd'.repeat(64), result: 'VERIFIED',
    evidence: [
      { check: 'Integrity Verification', component: 'Component 2', result: 'MATCH', detail: 'Hash matches registry.' },
      { check: 'Authenticity (Signature)', component: 'Component 3', result: 'VALID', detail: 'Signature valid.' },
      { check: 'Publisher / Trust Verification', component: 'Component 3', result: 'MATCH', detail: 'Publisher trusted.' },
      { check: 'Version / Freshness', component: 'Component 3', result: 'OK', detail: 'Matches latest approved version.' },
      { check: 'Trust Management History', component: 'Component 4', result: 'PRIOR_RECORD', detail: 'Previously VERIFIED.' },
    ],
    recommendation: 'All checks passed. Safe to install.', submittedBy: 'admin', timestamp: daysAgo(7),
  },

  // ── 2. UNTRUSTED EXAMPLES (FAILURES / ATTACKS) ──────────────────────────────
  {
    softwareName: 'Mozilla Firefox', claimedVersion: '127.0.1', publisher: 'Mozilla Foundation',
    fileHash: 'f'.repeat(64), result: 'UNTRUSTED',
    evidence: [
      { check: 'Integrity Verification', component: 'Component 2', result: 'MISMATCH', detail: 'Computed SHA-256 does NOT match registry reference! File has been altered or injected with payload.' },
      { check: 'Authenticity (Signature)', component: 'Component 3', result: 'VALID', detail: 'Original signature present but invalid for modified binary.' },
      { check: 'Publisher / Trust Verification', component: 'Component 3', result: 'MATCH', detail: 'Publisher in registry.' },
      { check: 'Version / Freshness', component: 'Component 3', result: 'OK', detail: 'Latest approved version.' },
      { check: 'Trust Management History', component: 'Component 4', result: 'NO_PRIOR_RECORD', detail: 'No prior record for this tampered hash.' },
    ],
    recommendation: 'CRITICAL WARNING: Binary checksum mismatch detected. File is corrupted or tampered. DO NOT INSTALL!', submittedBy: 'viewer', timestamp: daysAgo(8),
  },
  {
    softwareName: 'WannaDecryptor Pro', claimedVersion: '2.0.0', publisher: 'LockBit Cyber Gang',
    fileHash: 'deadbeef'.repeat(8), result: 'UNTRUSTED',
    evidence: [
      { check: 'Integrity Verification', component: 'Component 2', result: 'MISMATCH', detail: 'CRITICAL ALERT: Package flagged by Global Threat Intelligence. Malicious ransomware payload.' },
      { check: 'Authenticity (Signature)', component: 'Component 3', result: 'INVALID', detail: 'Self-signed invalid signature certificate.' },
      { check: 'Publisher / Trust Verification', component: 'Component 3', result: 'UNTRUSTED_PUBLISHER', detail: 'Publisher "LockBit Cyber Gang" is actively blacklisted in threat intelligence feeds.' },
      { check: 'Version / Freshness', component: 'Component 3', result: 'NO_REFERENCE', detail: 'Malicious entry flagged in system registry.' },
      { check: 'Trust Management History', component: 'Component 4', result: 'NO_PRIOR_RECORD', detail: 'No prior approved record.' },
    ],
    recommendation: 'MALICIOUS THREAT BLOCKED: Blacklisted publisher and malicious payload identified. Quarantine file immediately.', submittedBy: 'admin', timestamp: daysAgo(9),
  },
  {
    softwareName: 'CryptoMiner Pro', claimedVersion: '3.1.0', publisher: 'ShadowBytes LLC',
    fileHash: '2'.repeat(64), result: 'UNTRUSTED',
    evidence: [
      { check: 'Integrity Verification', component: 'Component 2', result: 'NO_REFERENCE', detail: 'No reference hash.' },
      { check: 'Authenticity (Signature)', component: 'Component 3', result: 'MISSING', detail: 'No signature.' },
      { check: 'Publisher / Trust Verification', component: 'Component 3', result: 'UNTRUSTED_PUBLISHER', detail: 'Publisher is flagged as untrusted.' },
      { check: 'Version / Freshness', component: 'Component 3', result: 'NO_REFERENCE', detail: 'Software is FLAGGED in registry.' },
      { check: 'Trust Management History', component: 'Component 4', result: 'NO_PRIOR_RECORD', detail: 'No prior VERIFIED record.' },
    ],
    recommendation: 'Publisher is untrusted. Do NOT install.', submittedBy: 'admin', timestamp: daysAgo(10),
  },

  // ── 3. SUSPICIOUS EXAMPLES (ROLLBACKS / IRREGULARITIES) ──────────────────────
  {
    softwareName: 'Visual Studio Code', claimedVersion: '1.85.0', publisher: 'Microsoft Corporation',
    fileHash: '1'.repeat(64), result: 'SUSPICIOUS',
    evidence: [
      { check: 'Integrity Verification', component: 'Component 2', result: 'MATCH', detail: 'Matches user-supplied hash.' },
      { check: 'Authenticity (Signature)', component: 'Component 3', result: 'MISSING', detail: 'No detached signature provided.' },
      { check: 'Publisher / Trust Verification', component: 'Component 3', result: 'MATCH', detail: 'Publisher trusted.' },
      { check: 'Version / Freshness', component: 'Component 3', result: 'ROLLBACK_DETECTED', detail: 'Claimed version 1.85.0 is OLDER than the latest approved version 1.91.0. Downgrade attack suspected.' },
      { check: 'Trust Management History', component: 'Component 4', result: 'NO_PRIOR_RECORD', detail: 'No prior VERIFIED record for this version.' },
    ],
    recommendation: 'Security rollback alert: Version 1.85.0 contains known CVE vulnerabilities. Review before installing.', submittedBy: 'admin', timestamp: daysAgo(11),
  },
  {
    softwareName: 'LibreOffice', claimedVersion: '24.2.4', publisher: 'The Document Foundation',
    fileHash: '3'.repeat(64), result: 'SUSPICIOUS',
    evidence: [
      { check: 'Integrity Verification', component: 'Component 2', result: 'NO_REFERENCE', detail: 'No registry hash for this publisher variant.' },
      { check: 'Authenticity (Signature)', component: 'Component 3', result: 'MISSING', detail: 'No digital signature provided.' },
      { check: 'Publisher / Trust Verification', component: 'Component 3', result: 'UNKNOWN_PUBLISHER', detail: 'The Document Foundation is not yet registered in trusted publisher list.' },
      { check: 'Version / Freshness', component: 'Component 3', result: 'NO_REFERENCE', detail: 'Software entry is currently UNDER_REVIEW.' },
      { check: 'Trust Management History', component: 'Component 4', result: 'NO_PRIOR_RECORD', detail: 'Software is under review.' },
    ],
    recommendation: 'Under review — await IT Security Administrator approval before deployment.', submittedBy: 'viewer', timestamp: daysAgo(12),
  },

  // ── 4. UNKNOWN EXAMPLES (NEW / UNREGISTERED TOOLS) ───────────────────────────
  {
    softwareName: 'QuickOptimizer', claimedVersion: '1.0.0', publisher: 'IndieDevStudio',
    fileHash: '8888'.repeat(16), result: 'UNKNOWN',
    evidence: [
      { check: 'Integrity Verification', component: 'Component 2', result: 'NO_REFERENCE', detail: 'No trusted reference hash found in registry or threat intelligence feeds.' },
      { check: 'Authenticity (Signature)', component: 'Component 3', result: 'MISSING', detail: 'No signature file provided.' },
      { check: 'Publisher / Trust Verification', component: 'Component 3', result: 'UNKNOWN_PUBLISHER', detail: 'Publisher "IndieDevStudio" is not in the trusted registry.' },
      { check: 'Version / Freshness', component: 'Component 3', result: 'NO_REFERENCE', detail: 'First submission for this software.' },
      { check: 'Trust Management History', component: 'Component 4', result: 'NO_PRIOR_RECORD', detail: 'Zero audit history found.' },
    ],
    recommendation: 'Insufficient reference data. Not an explicit security failure, but software must be registered first.', submittedBy: null, timestamp: daysAgo(13),
  },
  {
    softwareName: 'NewToolkit', claimedVersion: '1.0.0', publisher: 'StartupCorp',
    fileHash: '9'.repeat(64), result: 'UNKNOWN',
    evidence: [
      { check: 'Integrity Verification', component: 'Component 2', result: 'NO_REFERENCE', detail: 'No reference hash on record.' },
      { check: 'Authenticity (Signature)', component: 'Component 3', result: 'MISSING', detail: 'No signature provided.' },
      { check: 'Publisher / Trust Verification', component: 'Component 3', result: 'UNKNOWN_PUBLISHER', detail: 'Publisher not in registry.' },
      { check: 'Version / Freshness', component: 'Component 3', result: 'NO_REFERENCE', detail: 'No approved version on record.' },
      { check: 'Trust Management History', component: 'Component 4', result: 'NO_PRIOR_RECORD', detail: 'No prior record.' },
    ],
    recommendation: 'Insufficient reference data. Not a security failure — register this software first.', submittedBy: null, timestamp: daysAgo(14),
  },
];

async function ensureDatabaseExists() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASS || '';
  const dbName = process.env.DB_NAME || 'trustupdate';

  try {
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();
    console.log(`[SEED] Database "${dbName}" verified/created.`);
  } catch (err) {
    console.warn(`[SEED] Auto database creation note: ${err.message}`);
  }
}

async function seedDatabase() {
  if (process.env.DB_DIALECT !== 'sqlite') {
    await ensureDatabaseExists();
  }
  // Sync tables first (create if not exist)
  await sequelize.sync({ alter: true });

  // Clear existing data
  await VerificationRecord.destroy({ where: {}, truncate: true, cascade: true });
  await TrustedSoftware.destroy({ where: {}, truncate: true, cascade: true });
  await Publisher.destroy({ where: {}, truncate: true, cascade: true });
  await User.destroy({ where: {}, truncate: true, cascade: true });
  console.log('[SEED] Cleared existing data.');

  // Users: configurable via environment variables or securely generated on the fly
  const adminUsername = process.env.SEED_ADMIN_USER || 'admin';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(12).toString('base64url');
  const viewerUsername = process.env.SEED_VIEWER_USER || 'viewer';
  const viewerPassword = process.env.SEED_VIEWER_PASSWORD || crypto.randomBytes(12).toString('base64url');

  const adminUser = User.build({ username: adminUsername, role: 'admin' });
  adminUser.setPassword(adminPassword);
  const viewerUser = User.build({ username: viewerUsername, role: 'viewer' });
  viewerUser.setPassword(viewerPassword);
  await Promise.all([adminUser.save(), viewerUser.save()]);
  console.log(`[SEED] Created users: ${adminUsername} (admin), ${viewerUsername} (viewer)`);
  if (!process.env.SEED_ADMIN_PASSWORD || !process.env.SEED_VIEWER_PASSWORD) {
    console.log('[SEED] Note: Generated credentials displayed below (set SEED_ADMIN_PASSWORD / SEED_VIEWER_PASSWORD in .env to customize):');
    if (!process.env.SEED_ADMIN_PASSWORD) {
      console.log(`[SEED] Initial ${adminUsername} password: ${adminPassword}`);
    }
    if (!process.env.SEED_VIEWER_PASSWORD) {
      console.log(`[SEED] Initial ${viewerUsername} password: ${viewerPassword}`);
    }
  }

  // Publishers
  await Publisher.bulkCreate(publishers);
  console.log(`[SEED] Created ${publishers.length} publishers.`);

  // Trusted Software
  await TrustedSoftware.bulkCreate(trustedSoftware);
  console.log(`[SEED] Created ${trustedSoftware.length} trusted software entries.`);

  // Verification Records (bypass immutability by using bulkCreate with hooks:false)
  await VerificationRecord.bulkCreate(verificationRecords, { hooks: false });
  console.log(`[SEED] Created ${verificationRecords.length} verification records.`);

  console.log('\n✅ Seed complete! Database populated with realistic test records.');
  console.log(`   Admin username:  ${adminUsername}`);
  console.log(`   Viewer username: ${viewerUsername}`);
  console.log('   (Passwords configured via .env or generated during initialization)');
}

if (require.main === module) {
  seedDatabase()
    .then(() => sequelize.close())
    .catch((err) => {
      console.error('[SEED] Error:', err.message);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
