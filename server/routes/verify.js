/**
 * @module routes/verify
 * Multer is configured here with size/type validation.
 * Max file size: 500 MB (configurable via MAX_FILE_SIZE env var).
 * JWT is optional on this route — anonymous submissions are allowed,
 * but the submitter username is recorded when authenticated.
 */
const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const os = require('os');
const { body } = require('express-validator');
const { verify } = require('../controllers/verificationController');

const router = Router();

// ─── Multer Configuration ─────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, os.tmpdir()),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `trustupdate_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept all common binary/archive types; block obvious non-binary web types
  const blockedMime = ['text/html', 'text/javascript', 'application/x-php'];
  if (blockedMime.includes(file.mimetype)) {
    return cb(new Error(`File type ${file.mimetype} is not permitted for upload.`));
  }
  return cb(null, true);
};

const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE, 10) || 500 * 1024 * 1024; // 500 MB

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

// Accept a required `file` and an optional `signature` in the same request
const uploadFields = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'signature', maxCount: 1 },
]);

const validationRules = [
  body('softwareName')
    .trim()
    .notEmpty().withMessage('Software name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Software name must be between 2 and 100 characters.'),
  body('claimedVersion')
    .trim()
    .notEmpty().withMessage('Version is required.')
    .matches(/^\d+(\.\d+)+(-[a-zA-Z0-9.]+)?$/).withMessage('Version must be in semantic format (e.g. 1.0.0 or 127.0.1).'),
  body('publisher')
    .trim()
    .notEmpty().withMessage('Publisher name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Publisher name must be between 2 and 100 characters.'),
  body('referenceHash')
    .optional({ checkFalsy: true })
    .isHexadecimal().withMessage('Reference hash must be a valid hexadecimal string.')
    .isLength({ min: 64, max: 64 }).withMessage('Reference hash must be exactly 64 hex characters (SHA-256).'),
  body('publicKeyPem')
    .optional({ checkFalsy: true })
    .custom((val) => {
      if (val && (!val.includes('BEGIN PUBLIC KEY') || !val.includes('END PUBLIC KEY'))) {
        throw new Error('Public key must be in valid PEM format (-----BEGIN PUBLIC KEY-----).');
      }
      return true;
    }),
];

// Optional JWT — attach user if token present but don't require it
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const jwt = require('jsonwebtoken');
      req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    } catch {
      // ignore invalid token on optional auth
    }
  }
  next();
};

router.post('/', uploadFields, optionalAuth, validationRules, verify);

module.exports = router;
