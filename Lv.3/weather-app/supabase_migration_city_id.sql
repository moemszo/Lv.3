
-- Add city_id column to search_history
alter table search_history add column if not exists city_id bigint;

-- Add city_id column to favorites
alter table favorites add column if not exists city_id bigint;
