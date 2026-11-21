-- 001_initial_schema.sql

CREATE TABLE IF NOT EXISTS movies (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  release_year INT NOT NULL CHECK (release_year BETWEEN 1888 AND 2100),
  runtime INT NOT NULL CHECK (runtime BETWEEN 1 AND 300),
  watched BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE UNIQUE INDEX IF NOT EXISTS movies_title_lower_idx ON movies (LOWER(title));

CREATE TABLE IF NOT EXISTS movie_prerequisites (
  movie_id INT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  prerequisite_id INT NOT NULL REFERENCES movies(id) ON DELETE RESTRICT,
  PRIMARY KEY (movie_id, prerequisite_id),
  CONSTRAINT chk_not_self_prerequisite CHECK (movie_id <> prerequisite_id)
);

CREATE TABLE IF NOT EXISTS cinemas (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS cinemas_name_lower_idx ON cinemas (LOWER(name));

CREATE TABLE IF NOT EXISTS cinema_bundles (
  cinema_id INT NOT NULL REFERENCES cinemas(id) ON DELETE CASCADE,
  size INT NOT NULL CHECK (size BETWEEN 1 AND 500),
  PRIMARY KEY (cinema_id, size)
);
