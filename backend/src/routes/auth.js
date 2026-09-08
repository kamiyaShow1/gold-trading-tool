const express = require('express');
const { register, login, logout, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/logout', requireAuth, asyncHandler(logout));
router.get('/me', requireAuth, asyncHandler(me));

module.exports = router;
