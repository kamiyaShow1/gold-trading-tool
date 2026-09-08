const prisma = require('../config/database');

function toChapterSummary(chapter, completedSet) {
  return {
    chapterId: chapter.chapterId,
    title: chapter.title,
    category: chapter.category,
    difficulty: chapter.difficulty,
    estimatedTime: chapter.estimatedTime,
    order: chapter.order,
    completed: completedSet.has(chapter.chapterId),
  };
}

function toChapterDetail(chapter) {
  return {
    chapterId: chapter.chapterId,
    title: chapter.title,
    category: chapter.category,
    content: chapter.content,
    keyPoints: chapter.keyPoints,
    examples: chapter.examples,
    difficulty: chapter.difficulty,
    estimatedTime: chapter.estimatedTime,
    order: chapter.order,
    quizId: chapter.quizzes?.[0]?.id ?? null,
  };
}

async function getAllChaptersOrdered() {
  return prisma.learningContent.findMany({ orderBy: { order: 'asc' } });
}

async function getChapters(req, res) {
  const [allChapters, progress] = await Promise.all([
    getAllChaptersOrdered(),
    prisma.learningProgress.findUnique({ where: { userId: req.user.sub } }),
  ]);

  const completedSet = new Set(progress?.completedChapters || []);
  return res.json({ chapters: allChapters.map((c) => toChapterSummary(c, completedSet)) });
}

async function getChapterById(req, res) {
  const { chapterId } = req.params;

  const chapter = await prisma.learningContent.findUnique({
    where: { chapterId },
    include: { quizzes: { select: { id: true } } },
  });
  if (!chapter) {
    return res.status(404).json({ error: '指定された章が見つかりません' });
  }

  return res.json({ chapter: toChapterDetail(chapter) });
}

async function markComplete(req, res) {
  const { chapterId } = req.params;
  const userId = req.user.sub;

  const chapter = await prisma.learningContent.findUnique({ where: { chapterId } });
  if (!chapter) {
    return res.status(404).json({ error: '指定された章が見つかりません' });
  }

  const allChapters = await getAllChaptersOrdered();
  const existing = await prisma.learningProgress.findUnique({ where: { userId } });

  const completedChapters = new Set(existing?.completedChapters || []);
  const alreadyCompleted = completedChapters.has(chapterId);
  completedChapters.add(chapterId);

  const totalChapters = allChapters.length || 1;
  const progressPercent = Math.round((completedChapters.size / totalChapters) * 100);

  // 次章のアンロック制御は行わず、単に「次に学習すべき章」の目安として算出する
  const nextChapter = allChapters.find((c) => !completedChapters.has(c.chapterId));
  const currentChapter = nextChapter ? nextChapter.chapterId : chapterId;

  const addedStudyTime = alreadyCompleted ? 0 : chapter.estimatedTime || 0;

  const data = {
    completedChapters: Array.from(completedChapters),
    currentChapter,
    progressPercent,
    totalStudyTime: (existing?.totalStudyTime || 0) + addedStudyTime,
    lastStudyDate: new Date(),
  };

  const progress = existing
    ? await prisma.learningProgress.update({ where: { userId }, data })
    : await prisma.learningProgress.create({ data: { userId, ...data } });

  return res.json({
    success: true,
    progress: {
      completedChapters: progress.completedChapters,
      currentChapter: progress.currentChapter,
      progressPercent: progress.progressPercent,
    },
  });
}

async function getProgress(req, res) {
  const userId = req.user.sub;

  const [progress, allChapters] = await Promise.all([
    prisma.learningProgress.findUnique({ where: { userId } }),
    getAllChaptersOrdered(),
  ]);

  if (!progress) {
    return res.json({
      completedChapters: [],
      currentChapter: allChapters[0]?.chapterId || null,
      progressPercent: 0,
    });
  }

  return res.json({
    completedChapters: progress.completedChapters,
    currentChapter: progress.currentChapter,
    progressPercent: progress.progressPercent,
  });
}

module.exports = { getChapters, getChapterById, markComplete, getProgress };
