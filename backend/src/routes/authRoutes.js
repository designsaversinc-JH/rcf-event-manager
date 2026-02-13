const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const { query } = require('../config/db');
const { authenticate, requireJwtSecret } = require('../middleware/auth');
const {
  isFirebaseAdminConfigured,
  verifyFirebaseIdToken,
} = require('../config/firebaseAdmin');

const router = express.Router();

const issueSessionToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '12h',
  });

const sanitizeName = (value, fallback) => {
  const trimmed = String(value || '').trim();
  return trimmed || fallback;
};

router.post('/login', async (req, res, next) => {
  try {
    requireJwtSecret();
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const { rows } = await query(
      'SELECT id, email, name, role, password_hash FROM admin_users WHERE lower(email) = lower($1) LIMIT 1',
      [email]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = issueSessionToken(user);

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/firebase-login', async (req, res, next) => {
  try {
    requireJwtSecret();

    if (!isFirebaseAdminConfigured()) {
      return res
        .status(500)
        .json({ message: 'Firebase Admin is not configured on the backend.' });
    }

    const idToken = req.body?.idToken;
    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required.' });
    }

    const decoded = await verifyFirebaseIdToken(idToken);
    const firebaseEmail = decoded.email?.toLowerCase();

    if (!firebaseEmail) {
      return res.status(403).json({ message: 'Firebase account email is required.' });
    }

    const { rows } = await query(
      `SELECT id, email, name, role, firebase_uid
       FROM admin_users
       WHERE lower(email) = lower($1)
       LIMIT 1`,
      [firebaseEmail]
    );

    const user = rows[0];
    if (!user) {
      return res
        .status(403)
        .json({ message: 'Your account is not allowed in this admin dashboard.' });
    }

    if (!user.firebase_uid && decoded.uid) {
      await query(
        'UPDATE admin_users SET firebase_uid = $1, updated_at = NOW() WHERE id = $2',
        [decoded.uid, user.id]
      );
      user.firebase_uid = decoded.uid;
    }

    const token = issueSessionToken(user);

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    if (error?.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Firebase session expired. Please log in again.' });
    }

    if (error?.code === 'auth/argument-error' || error?.code === 'auth/invalid-id-token') {
      return res.status(401).json({ message: 'Invalid Firebase session token.' });
    }

    return next(error);
  }
});

router.post('/firebase-signup', async (req, res, next) => {
  try {
    requireJwtSecret();

    if (!isFirebaseAdminConfigured()) {
      return res
        .status(500)
        .json({ message: 'Firebase Admin is not configured on the backend.' });
    }

    const idToken = req.body?.idToken;
    const requestedName = req.body?.name;

    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required.' });
    }

    const decoded = await verifyFirebaseIdToken(idToken);
    const firebaseEmail = decoded.email?.toLowerCase();
    if (!firebaseEmail) {
      return res.status(400).json({ message: 'Firebase account email is required.' });
    }

    const safeName = sanitizeName(requestedName, decoded.name || firebaseEmail);

    const existingResult = await query(
      `SELECT id, email, name, role, firebase_uid
       FROM admin_users
       WHERE lower(email) = lower($1)
       LIMIT 1`,
      [firebaseEmail]
    );

    let user = existingResult.rows[0];

    if (user) {
      await query(
        `UPDATE admin_users
         SET firebase_uid = COALESCE(firebase_uid, $1),
             name = COALESCE(NULLIF($2, ''), name),
             updated_at = NOW()
         WHERE id = $3`,
        [decoded.uid || null, safeName, user.id]
      );

      const refreshed = await query(
        'SELECT id, email, name, role, firebase_uid FROM admin_users WHERE id = $1 LIMIT 1',
        [user.id]
      );
      user = refreshed.rows[0];
    } else {
      const userId = `admin-${randomUUID().slice(0, 8)}`;
      const placeholderHash = await bcrypt.hash(`${decoded.uid}:${Date.now()}`, 10);
      const role = 'admin';

      await query(
        `INSERT INTO admin_users (id, email, firebase_uid, name, password_hash, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [userId, firebaseEmail, decoded.uid || null, safeName, placeholderHash, role]
      );

      const created = await query(
        'SELECT id, email, name, role, firebase_uid FROM admin_users WHERE id = $1 LIMIT 1',
        [userId]
      );
      user = created.rows[0];
    }

    const token = issueSessionToken(user);
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    if (error?.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Firebase session expired. Please try again.' });
    }

    if (error?.code === 'auth/argument-error' || error?.code === 'auth/invalid-id-token') {
      return res.status(401).json({ message: 'Invalid Firebase session token.' });
    }

    return next(error);
  }
});

router.get('/me', authenticate, async (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = router;
