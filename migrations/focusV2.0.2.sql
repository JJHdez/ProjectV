
CREATE TABLE remember(
  id serial not null,
	created_at timestamp default now(),
	deleted_at timestamp,
	create_id integer,

  resource varchar (255) NOT NULL , -- the model is habit
  resource_id INTEGER NOT NULL,  -- 1

  every INTEGER,  -- 1,2,3 4,
  by VARCHAR(255), --- day, week, month, year
  due_date TIMESTAMP DEFAULT now() + '30 day',
  push_notify INT DEFAULT 0, -- 1
  email_notify INT DEFAULT 0, --
  date_notify DATE,
  time_notify TIME,
  last_datetime_notify TIMESTAMP, -- 2017-06-04 23:05:64
  params json
  /**
    week
      week_days : [month, tuesday, wednesday, thursday, friday, saturday, sunday]

  */
);
