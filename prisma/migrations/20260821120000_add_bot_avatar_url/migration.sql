-- Custom photo avatar for chatbots (image URL; overrides the emoji avatar)
ALTER TABLE "forms" ADD COLUMN "botAvatarUrl" TEXT;
