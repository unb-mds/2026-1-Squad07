-- CreateTable
CREATE TABLE "analyses" (
    "id" TEXT NOT NULL,
    "law_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "metrics" JSONB NOT NULL,
    "warnings" JSONB NOT NULL,
    "model_version" TEXT NOT NULL,
    "cached" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_law_id_fkey" FOREIGN KEY ("law_id") REFERENCES "laws"("id") ON DELETE CASCADE ON UPDATE CASCADE;
