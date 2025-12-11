-- AlterTable: Add bodyParts column (array of BodyPart)
ALTER TABLE "Exercise" ADD COLUMN "bodyParts" "BodyPart"[];

-- Migrate existing data: convert single bodyPart to array
UPDATE "Exercise" SET "bodyParts" = ARRAY["bodyPart"]::"BodyPart"[];

-- Make bodyParts NOT NULL after migration
ALTER TABLE "Exercise" ALTER COLUMN "bodyParts" SET NOT NULL;

-- Drop old unique constraint
DROP INDEX IF EXISTS "Exercise_name_bodyPart_key";

-- Drop old index
DROP INDEX IF EXISTS "Exercise_bodyPart_idx";

-- Drop old column
ALTER TABLE "Exercise" DROP COLUMN "bodyPart";

-- Add new unique constraint on name only
CREATE UNIQUE INDEX "Exercise_name_key" ON "Exercise"("name");
