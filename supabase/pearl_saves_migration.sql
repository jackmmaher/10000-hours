-- Migration: Add text preservation to pearl_saves
-- Run this in Supabase SQL Editor to enable saved pearl text preservation
-- When a user saves a pearl, the text is now copied so it survives if the original is deleted

ALTER TABLE public.pearl_saves ADD COLUMN IF NOT EXISTS text text;
ALTER TABLE public.pearl_saves ADD COLUMN IF NOT EXISTS saved_at timestamptz default now();
