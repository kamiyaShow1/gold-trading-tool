const prisma = require('../config/database');

function parseQuizId(raw) {
  const quizId = Number(raw);
  return Number.isInteger(quizId) ? quizId : null;
}

function toPublicQuiz(quiz) {
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    passingScore: quiz.passingScore,
    contentId: quiz.contentId,
  };
}

function toPublicQuestions(quiz) {
  const questions = quiz.questionsJson?.questions || [];
  return questions.map(({ questionId, question, options }) => ({ questionId, question, options }));
}

function isValidAnswers(answers) {
  return (
    Array.isArray(answers) &&
    answers.length > 0 &&
    answers.every(
      (a) => a && typeof a.questionId === 'string' && typeof a.selectedAnswer === 'string',
    )
  );
}

async function getQuiz(req, res) {
  const quizId = parseQuizId(req.params.quizId);
  if (quizId === null) {
    return res.status(404).json({ error: '指定されたクイズが見つかりません' });
  }

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) {
    return res.status(404).json({ error: '指定されたクイズが見つかりません' });
  }

  return res.json({ quiz: toPublicQuiz(quiz), questions: toPublicQuestions(quiz) });
}

async function submitQuiz(req, res) {
  const quizId = parseQuizId(req.params.quizId);
  if (quizId === null) {
    return res.status(404).json({ error: '指定されたクイズが見つかりません' });
  }

  const { answers } = req.body || {};
  if (!isValidAnswers(answers)) {
    return res.status(400).json({ error: '回答形式が不正です。answers: [{ questionId, selectedAnswer }] の形式で送信してください' });
  }

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) {
    return res.status(404).json({ error: '指定されたクイズが見つかりません' });
  }

  const questions = quiz.questionsJson?.questions || [];
  const answerByQuestionId = new Map(answers.map((a) => [a.questionId, a.selectedAnswer]));

  const wrongQuestions = [];
  let correctCount = 0;
  for (const q of questions) {
    const selected = answerByQuestionId.get(q.questionId);
    if (selected !== undefined && selected === q.correctAnswer) {
      correctCount += 1;
    } else {
      wrongQuestions.push(q);
    }
  }

  const total = questions.length || 1;
  const score = Math.round((correctCount / total) * 100);
  const passed = score >= (quiz.passingScore || 80);

  const feedback = passed
    ? 'よくできました！合格です。'
    : 'もう一歩です。間違えた問題を復習してから再挑戦しましょう。';

  const analysis =
    wrongQuestions.length === 0
      ? '全問正解です。このテーマは完璧に理解できています。'
      : `要復習の問題: ${wrongQuestions.map((q) => q.question).join('／')}`;

  await prisma.quizResult.create({
    data: {
      userId: req.user.sub,
      quizId,
      score,
      passed,
      answers,
      feedback: `${feedback} ${analysis}`,
    },
  });

  return res.json({ score, passed, feedback, analysis });
}

async function getResults(req, res) {
  const results = await prisma.quizResult.findMany({
    where: { userId: req.user.sub },
    orderBy: { attemptDate: 'desc' },
    include: { quiz: { select: { title: true } } },
  });

  return res.json({
    results: results.map((r) => ({
      id: r.id,
      quizId: r.quizId,
      quizTitle: r.quiz.title,
      score: r.score,
      passed: r.passed,
      attemptDate: r.attemptDate,
    })),
  });
}

async function getResultsByQuiz(req, res) {
  const quizId = parseQuizId(req.params.quizId);
  if (quizId === null) {
    return res.status(404).json({ error: '指定されたクイズが見つかりません' });
  }

  const results = await prisma.quizResult.findMany({
    where: { userId: req.user.sub, quizId },
    orderBy: { attemptDate: 'desc' },
  });

  return res.json({
    results: results.map((r) => ({
      id: r.id,
      quizId: r.quizId,
      score: r.score,
      passed: r.passed,
      attemptDate: r.attemptDate,
    })),
  });
}

module.exports = { getQuiz, submitQuiz, getResults, getResultsByQuiz };
