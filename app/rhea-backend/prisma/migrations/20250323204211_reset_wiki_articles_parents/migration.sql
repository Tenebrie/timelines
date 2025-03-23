-- Reset all wiki articles to fix circular dependencies
UPDATE "WikiArticle" SET "parentId" = NULL;