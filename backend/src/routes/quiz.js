const express = require('express');
const { getQuiz, submitQuiz, getResults, getResultsByQuiz } = require('../controllers/quizController');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

router.use(requireAuth);

// '/results' 系は '/:quizId' より先に定義し、'results' が quizId として誤って
// マッチしないようにする
router.get('/results', asyncHandler(getResults));
router.get('/results/:quizId', asyncHandler(getResultsByQuiz));
router.get('/:quizId', asyncHandler(getQuiz));
router.post('/:quizId/submit', asyncHandler(submitQuiz));

module.exports = router;
