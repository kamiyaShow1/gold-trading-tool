const express = require('express');
const { getChapters, getChapterById, markComplete, getProgress } = require('../controllers/learningController');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

router.use(requireAuth);

router.get('/chapters', asyncHandler(getChapters));
router.get('/progress', asyncHandler(getProgress));
router.get('/chapter/:chapterId', asyncHandler(getChapterById));
router.post('/mark-complete/:chapterId', asyncHandler(markComplete));

module.exports = router;
