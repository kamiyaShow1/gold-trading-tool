/*
  Warnings:

  - You are about to drop the column `userId` on the `LearningContent` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Quizzes` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "LearningProgress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "completedChapters" JSONB NOT NULL,
    "currentChapter" TEXT,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "totalStudyTime" INTEGER NOT NULL DEFAULT 0,
    "lastStudyDate" DATETIME,
    CONSTRAINT "LearningProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LearningContent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chapterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "keyPoints" JSONB,
    "examples" JSONB,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "estimatedTime" INTEGER,
    "order" INTEGER
);
INSERT INTO "new_LearningContent" ("category", "chapterId", "content", "difficulty", "estimatedTime", "examples", "id", "keyPoints", "order", "title") SELECT "category", "chapterId", "content", "difficulty", "estimatedTime", "examples", "id", "keyPoints", "order", "title" FROM "LearningContent";
DROP TABLE "LearningContent";
ALTER TABLE "new_LearningContent" RENAME TO "LearningContent";
CREATE UNIQUE INDEX "LearningContent_chapterId_key" ON "LearningContent"("chapterId");
CREATE TABLE "new_Quizzes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contentId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "questionsJson" JSONB NOT NULL,
    "passingScore" INTEGER NOT NULL DEFAULT 80,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Quizzes_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "LearningContent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Quizzes" ("contentId", "createdAt", "description", "id", "passingScore", "questionsJson", "title") SELECT "contentId", "createdAt", "description", "id", "passingScore", "questionsJson", "title" FROM "Quizzes";
DROP TABLE "Quizzes";
ALTER TABLE "new_Quizzes" RENAME TO "Quizzes";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "LearningProgress_userId_key" ON "LearningProgress"("userId");
