-- Migration: Recreate IVFFlat indexes for 1024-dim embeddings
-- Issue: #133 - Migrate vector columns to 1024-dim for Voyage AI embeddings
--
-- IVFFlat indexes require data for cluster training, so this migration
-- must run after embeddings have been populated via the embed Edge Function.

CREATE INDEX idx_adversaries_embedding
  ON public.daggerheart_adversaries
  USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_armor_embedding
  ON public.daggerheart_armor
  USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_consumables_embedding
  ON public.daggerheart_consumables
  USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_environments_embedding
  ON public.daggerheart_environments
  USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_frames_embedding
  ON public.daggerheart_frames
  USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_game_content_embedding
  ON public.daggerheart_game_content
  USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_items_embedding
  ON public.daggerheart_items
  USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_weapons_embedding
  ON public.daggerheart_weapons
  USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX sage_knowledge_embedding_idx
  ON public.sage_knowledge
  USING ivfflat (embedding vector_cosine_ops);
