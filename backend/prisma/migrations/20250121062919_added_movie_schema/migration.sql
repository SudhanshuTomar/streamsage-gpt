-- CreateTable
CREATE TABLE "Movie" (
    "id" INTEGER NOT NULL,
    "posterPath" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);
