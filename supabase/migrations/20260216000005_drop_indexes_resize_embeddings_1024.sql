-- Migration: Drop IVFFlat indexes and resize embedding columns from vector(1536) to vector(1024)
-- Issue: #133 - Migrate vector columns to 1024-dim for Voyage AI embeddings
--
-- This migration prepares the database for new 1024-dim Voyage AI embeddings
-- by dropping the existing indexes, clearing incompatible 1536-dim data,
-- and resizing the columns.

-- Drop all 9 IVFFlat indexes before resizing columns
DROP INDEX IF EXISTS idx_adversaries_embedding;
DROP INDEX IF EXISTS idx_armor_embedding;
DROP INDEX IF EXISTS idx_consumables_embedding;
DROP INDEX IF EXISTS idx_environments_embedding;
DROP INDEX IF EXISTS idx_frames_embedding;
DROP INDEX IF EXISTS idx_game_content_embedding;
DROP INDEX IF EXISTS idx_items_embedding;
DROP INDEX IF EXISTS idx_weapons_embedding;
DROP INDEX IF EXISTS sage_knowledge_embedding_idx;

-- Clear all existing 1536-dim embeddings (incompatible with new 1024-dim)
UPDATE daggerheart_adversaries SET embedding = NULL WHERE embedding IS NOT NULL;
UPDATE daggerheart_armor SET embedding = NULL WHERE embedding IS NOT NULL;
UPDATE daggerheart_consumables SET embedding = NULL WHERE embedding IS NOT NULL;
UPDATE daggerheart_environments SET embedding = NULL WHERE embedding IS NOT NULL;
UPDATE daggerheart_frames SET embedding = NULL WHERE embedding IS NOT NULL;
UPDATE daggerheart_game_content SET embedding = NULL WHERE embedding IS NOT NULL;
UPDATE daggerheart_items SET embedding = NULL WHERE embedding IS NOT NULL;
UPDATE daggerheart_weapons SET embedding = NULL WHERE embedding IS NOT NULL;
UPDATE sage_knowledge SET embedding = NULL WHERE embedding IS NOT NULL;

-- Resize embedding columns from vector(1536) to vector(1024)
ALTER TABLE daggerheart_adversaries ALTER COLUMN embedding TYPE vector(1024);
ALTER TABLE daggerheart_armor ALTER COLUMN embedding TYPE vector(1024);
ALTER TABLE daggerheart_consumables ALTER COLUMN embedding TYPE vector(1024);
ALTER TABLE daggerheart_environments ALTER COLUMN embedding TYPE vector(1024);
ALTER TABLE daggerheart_frames ALTER COLUMN embedding TYPE vector(1024);
ALTER TABLE daggerheart_game_content ALTER COLUMN embedding TYPE vector(1024);
ALTER TABLE daggerheart_items ALTER COLUMN embedding TYPE vector(1024);
ALTER TABLE daggerheart_weapons ALTER COLUMN embedding TYPE vector(1024);
ALTER TABLE sage_knowledge ALTER COLUMN embedding TYPE vector(1024);
