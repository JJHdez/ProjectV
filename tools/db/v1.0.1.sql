CREATE TABLE users
(
    id SERIAL PRIMARY KEY NOT NULL,
    create_date TIMESTAMP DEFAULT timezone('UTC'::text, now()) NOT NULL,
    facebook VARCHAR(255) DEFAULT NULL::character varying,
    google_plus VARCHAR(255) DEFAULT NULL::character varying,
    email VARCHAR(100) NOT NULL,
    name VARCHAR(100),
    last_name VARCHAR(100),
    cover TEXT,
    timezone VARCHAR(100) DEFAULT 'UTC'::character varying,
    password VARCHAR(100)
);

CREATE TABLE dreams
(
    id SERIAL PRIMARY KEY NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    deleted_at TIMESTAMP,
    create_id INTEGER,
    name VARCHAR(255) NOT NULL,
    due_date_at DATE,
    completed_at TIMESTAMP,
    CONSTRAINT dreams_create_id_fkey FOREIGN KEY (create_id) REFERENCES users (id)
);
CREATE TABLE habits
(
    id SERIAL PRIMARY KEY NOT NULL,
    created_date TIMESTAMP DEFAULT timezone('UTC'::text, now()) NOT NULL,
    user_id INTEGER,
    finished_date TIMESTAMP,
    closed_date TIMESTAMP,
    name VARCHAR(200),
    CONSTRAINT habits_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id)
);
CREATE TABLE history_habits
(
    id SERIAL PRIMARY KEY NOT NULL,
    created_date TIMESTAMP DEFAULT timezone('UTC'::text, now()) NOT NULL,
    user_id INTEGER,
    habit_id INTEGER,
    state VARCHAR(100),
    CONSTRAINT history_habits_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT history_habits_habit_id_fkey FOREIGN KEY (habit_id) REFERENCES habits (id)
);
CREATE TABLE pendings
(
    id SERIAL PRIMARY KEY NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    deleted_at TIMESTAMP,
    create_id INTEGER,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    completed_at TIMESTAMP,
    CONSTRAINT pendings_create_id_fkey FOREIGN KEY (create_id) REFERENCES users (id)
);
CREATE TABLE pomodoro_activities
(
    id SERIAL PRIMARY KEY NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    deleted_at TIMESTAMP,
    create_id INTEGER,
    name VARCHAR(100) NOT NULL,
    timer TIME NOT NULL,
    start_datetime_at TIMESTAMP,
    due_datetime_at TIMESTAMP,
    CONSTRAINT pomodoro_activities_create_id_fkey FOREIGN KEY (create_id) REFERENCES users (id)
);
CREATE TABLE projects
(
    id SERIAL PRIMARY KEY NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    deleted_at TIMESTAMP,
    create_id INTEGER,
    name VARCHAR(255) NOT NULL,
    completed_at TIMESTAMP,
    CONSTRAINT projects_create_id_fkey FOREIGN KEY (create_id) REFERENCES users (id)
);
CREATE TABLE project_tasks
(
    id SERIAL PRIMARY KEY NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    deleted_at TIMESTAMP,
    create_id INTEGER,
    project_id INTEGER,
    parent_id INTEGER,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date_at DATE,
    due_date_at DATE,
    completed_at TIMESTAMP,
    CONSTRAINT project_tasks_create_id_fkey FOREIGN KEY (create_id) REFERENCES users (id),
    CONSTRAINT project_tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id)
);

CREATE TABLE project_task_participed
(
    id SERIAL PRIMARY KEY NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    deleted_at TIMESTAMP,
    create_id INTEGER,
    project_task_id INTEGER,
    assigned_user_id INTEGER,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date_at DATE,
    due_date_at DATE,
    completed_at TIMESTAMP,
    CONSTRAINT project_participated_create_id_fkey FOREIGN KEY (create_id) REFERENCES users (id),
    CONSTRAINT project_participated_project_task_id_fkey FOREIGN KEY (project_task_id) REFERENCES project_tasks (id),
    CONSTRAINT project_participated_assigned_user_id_fkey FOREIGN KEY (assigned_user_id) REFERENCES users (id)
);

CREATE TABLE project_teams
(
    id SERIAL PRIMARY KEY NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    deleted_at TIMESTAMP,
    create_id INTEGER,
    name VARCHAR(255) NOT NULL,
    CONSTRAINT project_teams_create_id_fkey FOREIGN KEY (create_id) REFERENCES users (id)
);
CREATE TABLE project_teams_projects
(
    id SERIAL PRIMARY KEY NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    deleted_at TIMESTAMP,
    create_id INTEGER,
    user_id INTEGER,
    project_id INTEGER,
    team_id INTEGER,
    CONSTRAINT project_teams_projects_create_id_fkey FOREIGN KEY (create_id) REFERENCES users (id),
    CONSTRAINT project_teams_projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT project_teams_projects_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id),
    CONSTRAINT project_teams_projects_team_id_fkey FOREIGN KEY (team_id) REFERENCES project_teams (id)
);
CREATE TABLE project_task_issues
(
    id SERIAL PRIMARY KEY NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    deleted_at TIMESTAMP,
    create_id INTEGER,
    project_task_id INTEGER,
    assigned_user_id INTEGER,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    kind VARCHAR(100) DEFAULT 'bug'::character varying NOT NULL,
    priority VARCHAR(100) DEFAULT 'major'::character varying NOT NULL,
    completed_at TIMESTAMP,
    CONSTRAINT project_task_issues_create_id_fkey FOREIGN KEY (create_id) REFERENCES users (id),
    CONSTRAINT project_task_issues_project_task_id_fkey FOREIGN KEY (project_task_id) REFERENCES project_tasks (id),
    CONSTRAINT project_task_issues_assigned_user_id_fkey FOREIGN KEY (assigned_user_id) REFERENCES users (id)
);

CREATE TABLE tags
(
    id SERIAL PRIMARY KEY NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    deleted_at TIMESTAMP,
    create_id INTEGER,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    CONSTRAINT tags_create_id_fkey FOREIGN KEY (create_id) REFERENCES users (id)
);
CREATE TABLE token
(
    id SERIAL PRIMARY KEY NOT NULL,
    create_date TIMESTAMP DEFAULT timezone('UTC'::text, now()) NOT NULL,
    token VARCHAR(100),
    expired TIMESTAMP,
    user_id INTEGER,
    kind VARCHAR(50) DEFAULT 'auth-app'::character varying,
    CONSTRAINT token_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE UNIQUE INDEX users_facebook_key ON users (facebook);
CREATE UNIQUE INDEX users_google_plus_key ON users (google_plus);
CREATE UNIQUE INDEX users_email_key ON users (email);
CREATE TABLE wishes
(
    id SERIAL PRIMARY KEY NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    deleted_at TIMESTAMP,
    create_id INTEGER,
    name VARCHAR(255) NOT NULL,
    priority INTEGER DEFAULT 1,
    due_date_at DATE,
    completed_at TIMESTAMP,
    CONSTRAINT wishes_create_id_fkey FOREIGN KEY (create_id) REFERENCES users (id)
);
-- CREATE FUNCTION is_login(TEXT) RETURNS JSON;
-- CREATE FUNCTION login(TEXT, TEXT, TEXT, TEXT) RETURNS JSON;
-- CREATE FUNCTION token(TEXT, TEXT, INTEGER, TEXT) RETURNS TEXT;

CREATE FUNCTION is_login (text) RETURNS json
LANGUAGE plpgsql
AS $$
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
$$;

CREATE FUNCTION login (text, text, text, text) RETURNS json
LANGUAGE plpgsql
AS $$
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
$$;

CREATE FUNCTION token (text, text, integer, text) RETURNS text
LANGUAGE plpgsql
AS $$
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
$$;
