-- Add access identity credentials to internal users
ALTER TABLE "users" ADD COLUMN "password_hash" TEXT;

UPDATE "users"
SET "email" = CONCAT('user-', "id", '@oficina.local')
WHERE "email" IS NULL;

UPDATE "users"
SET "password_hash" = 'scrypt:seed-default-access:6hOw57XkVvloQ+v/IE+f2ny4+EbXLptHDp6Fno4UQkgBObtJqTbFJoM99fyoHxTYkYsBY65Cu7fY6rwarJZXMQ=='
WHERE "password_hash" IS NULL;

ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL;

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
