-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN "inviteCode" TEXT;

-- Backfill existing rows with a random 8-character code
UPDATE "Workspace"
SET "inviteCode" = substr(md5(random()::text || clock_timestamp()::text), 1, 8)
WHERE "inviteCode" IS NULL;

-- Enforce NOT NULL now that every row has a value
ALTER TABLE "Workspace" ALTER COLUMN "inviteCode" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_inviteCode_key" ON "Workspace"("inviteCode");
