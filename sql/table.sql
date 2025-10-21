-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.eula_agreements (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  terms_agreed boolean NOT NULL DEFAULT false,
  privacy_agreed boolean DEFAULT false,
  user_id text NOT NULL,
  CONSTRAINT eula_agreements_pkey PRIMARY KEY (id)
);
CREATE TABLE public.reports (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  review_id bigint NOT NULL,
  reason text NOT NULL,
  reporter text NOT NULL,
  CONSTRAINT reports_pkey PRIMARY KEY (id)
);
CREATE TABLE public.reviews (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  room_id bigint NOT NULL,
  context text,
  rent_type text NOT NULL,
  deposit numeric,
  rent numeric,
  move_at text NOT NULL,
  floor text,
  score numeric NOT NULL,
  author text NOT NULL,
  edited_at timestamp with time zone,
  deleted_at timestamp with time zone,
  CONSTRAINT reviews_pkey PRIMARY KEY (id)
);
CREATE TABLE public.rooms (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  address text NOT NULL,
  author text NOT NULL,
  updated_at timestamp with time zone,
  postcode text,
  CONSTRAINT rooms_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  social_login text,
  black_reviews ARRAY,
  black_users ARRAY,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);