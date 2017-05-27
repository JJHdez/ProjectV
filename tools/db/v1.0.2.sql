ALTER TABLE public.project_task_issues DROP COLUMN project_task_id;
ALTER TABLE public.project_task_issues
ADD COLUMN project_task_participed_id INTEGER;
ALTER TABLE public.project_task_issues ADD FOREIGN KEY (project_task_participed_id)
REFERENCES project_task_participed (id);

CREATE TABLE project_comments
(
  id SERIAL NOT NULL ,
  created_at timestamp default now(),
  deleted_at timestamp without time zone,
  create_id integer,
  resource character varying NOT NULL,
  resource_id integer NOT NULL,
  comment text NOT NULL,
  CONSTRAINT project_comments_pkey PRIMARY KEY (id),
  CONSTRAINT project_comments_create_id_fkey FOREIGN KEY (create_id)
      REFERENCES public.users (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
);