const express = require('express');
const authRoutes = require('./authRoutes');
const publicRoutes = require('./publicRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
