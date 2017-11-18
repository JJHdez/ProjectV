
create table dreams
(
	id serial not null
		constraint dreams_pkey
			primary key,
	created_at timestamp default now() not null,
	deleted_at timestamp,
	create_id integer,
	name varchar(255) not null,
	due_date_at date,
	completed_at timestamp
)
;

create table habits
(
	id serial not null
		constraint habits_pkey
			primary key,
	created_date timestamp default now() not null,
	user_id integer,
	finished_date timestamp,
	closed_date timestamp,
	name varchar(200)
)
;

create table history_habits
(
	id serial not null
		constraint history_habits_pkey
			primary key,
	created_date timestamp default now() not null,
	user_id integer,
	habit_id integer
		constraint history_habits_habit_id_fkey
			references habits
				on delete cascade,
	state varchar(100)
)
;

create table pendings
(
	id serial not null
		constraint pendings_pkey
			primary key,
	created_at timestamp default now() not null,
	deleted_at timestamp,
	create_id integer,
	name varchar(255) not null,
	description text,
	completed_at timestamp
)
;

create table pomodoro_activities
(
	id serial not null,
	created_at timestamp default now() not null,
	deleted_at timestamp,
	create_id integer,
	name varchar(100) not null,
	timer time not null,
	start_datetime_at timestamp,
	due_datetime_at timestamp
)
;

create table project_task_participed
(
	id serial not null
		constraint project_participated_pkey
			primary key,
	created_at timestamp default now() not null,
	deleted_at timestamp,
	create_id integer,
	project_task_id integer,
	assigned_user_id integer,
	name varchar(255) not null,
	description text,
	start_date_at date,
	due_date_at date,
	completed_at timestamp
)
;

create table project_task_issues
(
	id serial not null
		constraint project_task_issues_pkey
			primary key,
	created_at timestamp default now() not null,
	deleted_at timestamp,
	create_id integer,
	assigned_user_id integer,
	name varchar(255) not null,
	description text,
	kind varchar(100) default 'bug'::character varying not null,
	priority varchar(100) default 'major'::character varying not null,
	completed_at timestamp,
	project_task_participed_id integer
		constraint project_task_issues_project_task_participed_id_fkey
			references project_task_participed
)
;

create table project_tasks
(
	id serial not null
		constraint project_tasks_pkey
			primary key,
	created_at timestamp default now() not null,
	deleted_at timestamp,
	create_id integer,
	project_id integer,
	parent_id integer,
	name varchar(255) not null,
	description text,
	start_date_at date,
	due_date_at date,
	completed_at timestamp
)
;

alter table project_task_participed
	add constraint project_participated_project_task_id_fkey
		foreign key (project_task_id) references project_tasks
			on delete cascade
;

create table project_teams
(
	id serial not null
		constraint project_teams_pkey
			primary key,
	created_at timestamp default now() not null,
	deleted_at timestamp,
	create_id integer,
	name varchar(255) not null
)
;

create table project_teams_projects
(
	id serial not null
		constraint project_teams_projects_pkey
			primary key,
	created_at timestamp default now() not null,
	deleted_at timestamp,
	create_id integer,
	user_id integer,
	project_id integer,
	team_id integer
		constraint project_teams_projects_team_id_fkey
			references project_teams
				on delete cascade
)
;

create table projects
(
	id serial not null
		constraint projects_pkey
			primary key,
	created_at timestamp default now() not null,
	deleted_at timestamp,
	create_id integer,
	name varchar(255) not null,
	completed_at timestamp
)
;

alter table project_tasks
	add constraint project_tasks_project_id_fkey
		foreign key (project_id) references projects
			on delete cascade
;

alter table project_teams_projects
	add constraint project_teams_projects_project_id_fkey
		foreign key (project_id) references projects
			on delete cascade
;

create table tags
(
	id serial not null
		constraint tags_pkey
			primary key,
	created_at timestamp default now() not null,
	deleted_at timestamp,
	create_id integer,
	name varchar(255) not null,
	type varchar(50) not null
)
;

create table token
(
	id serial not null
		constraint token_pkey
			primary key,
	create_date timestamp default  now() not null,
	token varchar(100),
	expired timestamp,
	user_id integer,
	kind varchar(50) default 'auth-app'::character varying
)
;

create table users
(
	id serial not null
		constraint users_pkey
			primary key,
	create_date timestamp default now() not null,
	facebook varchar(255) default NULL::character varying
		constraint users_facebook_key
			unique,
	google_plus varchar(255) default NULL::character varying
		constraint users_google_plus_key
			unique,
	email varchar(100) not null
		constraint users_email_key
			unique,
	name varchar(100),
	last_name varchar(100),
	cover text,
	timezone varchar(100) default 'UTC'::character varying,
	password varchar(100)
)
;

alter table dreams
	add constraint dreams_create_id_fkey
		foreign key (create_id) references users
			on delete cascade
;

alter table habits
	add constraint habits_user_id_fkey
		foreign key (user_id) references users
			on delete cascade
;

alter table history_habits
	add constraint history_habits_user_id_fkey
		foreign key (user_id) references users
			on delete cascade
;

alter table pendings
	add constraint pendings_create_id_fkey
		foreign key (create_id) references users
			on delete cascade
;

alter table pomodoro_activities
	add constraint pomodoro_activities_create_id_fkey
		foreign key (create_id) references users
;

alter table project_task_participed
	add constraint project_participated_create_id_fkey
		foreign key (create_id) references users
			on delete cascade
;

alter table project_task_participed
	add constraint project_participated_assigned_user_id_fkey
		foreign key (assigned_user_id) references users
			on delete cascade
;

alter table project_task_issues
	add constraint project_task_issues_create_id_fkey
		foreign key (create_id) references users
			on delete cascade
;

alter table project_task_issues
	add constraint project_task_issues_assigned_user_id_fkey
		foreign key (assigned_user_id) references users
			on delete cascade
;

alter table project_tasks
	add constraint project_tasks_create_id_fkey
		foreign key (create_id) references users
			on delete cascade
;

alter table project_teams
	add constraint project_teams_create_id_fkey
		foreign key (create_id) references users
			on delete cascade
;

alter table project_teams_projects
	add constraint project_teams_projects_create_id_fkey
		foreign key (create_id) references users
			on delete cascade
;

alter table project_teams_projects
	add constraint project_teams_projects_user_id_fkey
		foreign key (user_id) references users
			on delete cascade
;

alter table projects
	add constraint projects_create_id_fkey
		foreign key (create_id) references users
			on delete cascade
;

alter table tags
	add constraint tags_create_id_fkey
		foreign key (create_id) references users
			on delete cascade
;

alter table token
	add constraint token_user_id_fkey
		foreign key (user_id) references users
;

create table wishes
(
	id serial not null
		constraint wishes_pkey
			primary key,
	created_at timestamp default now() not null,
	deleted_at timestamp,
	create_id integer
		constraint wishes_create_id_fkey
			references users
				on delete cascade,
	name varchar(255) not null,
	priority integer default 1,
	due_date_at date,
	completed_at timestamp
)
;

create table project_comments
(
	id serial not null
		constraint project_comments_pkey
			primary key,
	created_at timestamp default now(),
	deleted_at timestamp,
	create_id integer
		constraint project_comments_create_id_fkey
			references users,
	resource varchar not null,
	resource_id integer not null,
	comment text not null
)
;


-- Function: token(text, text, integer, text)

-- DROP FUNCTION token(text, text, integer, text);

CREATE OR REPLACE FUNCTION token(
    text,
    text,
    integer,
    text)
  RETURNS text AS
$BODY$
DECLARE
  _action ALIAS FOR $1;
  _token ALIAS FOR $2;
  _user_id ALIAS FOR $3;
  _kind ALIAS FOR $4;

  _token_tmp VARCHAR(100);
  _expired TIMESTAMP;
BEGIN
  _token_tmp := uuid_in(md5(random()::text || _token ||now()::text)::cstring);
  _expired :=current_timestamp + INTERVAL '30 minutes';
  IF _action = 'refresh' THEN
    INSERT INTO token VALUES (DEFAULT,DEFAULT,_token_tmp, _expired, (SELECT user_id FROM token WHERE token=_token), DEFAULT);
  END IF;
  IF _action = 'create' THEN
    INSERT INTO token VALUES (DEFAULT,DEFAULT,_token_tmp,_expired, _user_id, _kind);
  END IF;
  RETURN _token_tmp;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

  -- Function: login(text, text, text, text)

-- DROP FUNCTION login(text, text, text, text);

CREATE OR REPLACE FUNCTION login(
    text,
    text,
    text,
    text)
  RETURNS json AS
$BODY$
DECLARE
  _email ALIAS FOR $1;
  _uid ALIAS FOR $2;
  _auth ALIAS FOR $3;
  _token ALIAS FOR $4;
  -- Local var
  _id INTEGER;
  _new_token VARCHAR(100);
  _user TEXT;
  _status_code INTEGER;
BEGIN
  _status_code = 404;
  _new_token = _user = '';
  _id = -1;
  IF _auth= 'facebook' THEN
    IF EXISTS(SELECT * FROM users u WHERE u.facebook=_uid AND u.email = _email) THEN
      _id:=(SELECT id FROM users u WHERE u.facebook=_uid AND u.email = _email);
      _token:=(SELECT token('create',_token,_id,'auth-app'));
      RETURN '{"status_code": 200, "token":"'||_token||'"}';
    END IF;
  END IF;
  IF _auth= 'google' THEN
    IF EXISTS(SELECT * FROM users u WHERE u.google_plus=_uid AND u.email = _email) THEN
      SELECT id INTO _id FROM users u WHERE u.google_plus=_uid AND u.email = _email;
    ELSE
      INSERT INTO users (google_plus, email) VALUES (_uid, _email) RETURNING id INTO _id;
    END IF;
    _status_code = 200;
  END IF;
  IF _auth= 'email' THEN
    IF EXISTS(SELECT * FROM users u WHERE u.password=_uid AND u.email = _email) THEN
      SELECT id INTO _id FROM users u WHERE u.password=_uid AND u.email = _email;
      _status_code = 200;
    END IF;
  END IF;
  IF _id > 0 THEN
    _new_token:=(SELECT token('create',_token,_id,'auth-app'));
    SELECT row_to_json(t) INTO _user
    FROM (
           SELECT id , email,name,last_name, cover, timezone, _new_token AS token
           FROM users WHERE id = _id
         )t;
  END IF;
  RETURN '{"status_code": '|| _status_code ||',"user":'||_user||'}';
  EXCEPTION WHEN others THEN
  _status_code = 400;
  RETURN '{"status_code": '|| _status_code ||',"user":'||_user||'}';
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

  -- Function: is_login(text)

-- DROP FUNCTION is_login(text);

CREATE OR REPLACE FUNCTION is_login(text)
  RETURNS json AS
$BODY$
DECLARE
  _token ALIAS FOR $1;
  _data JSON;
BEGIN
  IF EXISTS(SELECT expired,user_id FROM token WHERE token = _token) THEN
    SELECT row_to_json(tx) INTO _data FROM (
                                             SELECT 200 status_code, tt.*  FROM (
                                                                                  SELECT row_to_json(t) as  user FROM (
                                                                                                                        SELECT  u.id, email, name, last_name, cover, timezone
                                                                                                                        FROM users u INNER JOIN token t ON u.id = t.user_id WHERE
                                                                                                                          token = _token
                                                                                                                      )t
                                                                                )tt
                                           )tx;
    RETURN _data;
  END IF;
  RETURN '{"status_code":401}';
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

  -- Function: datediff(character varying, timestamp without time zone, timestamp without time zone)

-- DROP FUNCTION datediff(character varying, timestamp without time zone, timestamp without time zone);

CREATE OR REPLACE FUNCTION datediff(
    units character varying,
    start_t timestamp without time zone,
    end_t timestamp without time zone)
  RETURNS integer AS
$BODY$
   DECLARE
     diff_interval INTERVAL;
     diff INT = 0;
     years_diff INT = 0;
   BEGIN
     IF units IN ('yy', 'yyyy', 'year', 'mm', 'm', 'month') THEN
       years_diff = DATE_PART('year', end_t) - DATE_PART('year', start_t);

       IF units IN ('yy', 'yyyy', 'year') THEN
         -- SQL Server does not count full years passed (only difference between year parts)
         RETURN years_diff;
       ELSE
         -- If end month is less than start month it will subtracted
         RETURN years_diff * 12 + (DATE_PART('month', end_t) - DATE_PART('month', start_t));
       END IF;
     END IF;

     -- Minus operator returns interval 'DDD days HH:MI:SS'
     diff_interval = end_t - start_t;

     diff = diff + DATE_PART('day', diff_interval);

     IF units IN ('wk', 'ww', 'week') THEN
       diff = diff/7;
       RETURN diff;
     END IF;

     IF units IN ('dd', 'd', 'day') THEN
       RETURN diff;
     END IF;

     diff = diff * 24 + DATE_PART('hour', diff_interval);

     IF units IN ('hh', 'hour') THEN
        RETURN diff;
     END IF;

     diff = diff * 60 + DATE_PART('minute', diff_interval);

     IF units IN ('mi', 'n', 'minute') THEN
        RETURN diff;
     END IF;

     diff = diff * 60 + DATE_PART('second', diff_interval);

     RETURN diff;
   END;
   $BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
