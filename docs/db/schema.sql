-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.books (
  title text NOT NULL,
  author text NOT NULL,
  genre text NOT NULL,
  page_count integer NOT NULL,
  CONSTRAINT books_pkey PRIMARY KEY (title)
);
CREATE TABLE public.books_being_read (
  being_read_id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  genre text NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  CONSTRAINT books_being_read_pkey PRIMARY KEY (being_read_id)
);
CREATE TABLE public.books_read (
  read_id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  genre text NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  CONSTRAINT books_read_pkey PRIMARY KEY (read_id)
);
CREATE TABLE public.books_to_read (
  to_read_id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  genre text NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  CONSTRAINT books_to_read_pkey PRIMARY KEY (to_read_id)
);
