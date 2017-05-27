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
