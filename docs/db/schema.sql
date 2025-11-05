-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.books (
  title text NOT NULL,
  author text NOT NULL,
  genre text NOT NULL,
  page_count integer NOT NULL,
  CONSTRAINT books_pkey PRIMARY KEY (title)
);
CREATE TABLE public.users (
  email text NOT NULL,
  password text NOT NULL,
  books_to_read ARRAY NOT NULL,
  books_reading ARRAY NOT NULL,
  books_read ARRAY NOT NULL,
  sharing_data boolean NOT NULL,
  CONSTRAINT users_pkey PRIMARY KEY (email)
);
