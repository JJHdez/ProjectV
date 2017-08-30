
ALTER TABLE dreams ADD COLUMN reward CHARACTER VARYING (500) DEFAULT '';
ALTER TABLE dreams ADD COLUMN reach_goal CHARACTER VARYING (500) DEFAULT '';

SELECT *
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'dreams';
select * from dreams;