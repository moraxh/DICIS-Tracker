import sqlite3

from utils import professor_id as generate_professor_id
from utils import room_id as generate_room_id
from utils import subject_id as generate_subject_id


def init_db(conn):
  cursor = conn.cursor()
  cursor.executescript("""
        CREATE TABLE IF NOT EXISTS location (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            campus TEXT,
            division TEXT,
            headquarters TEXT,
            UNIQUE(campus, division, headquarters)
        );

        CREATE TABLE IF NOT EXISTS course (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            location_id INTEGER,
            updated_at DATETIME,
            FOREIGN KEY(location_id) REFERENCES location(id)
        );

        CREATE TABLE IF NOT EXISTS professor (
            id TEXT PRIMARY KEY,
            names TEXT,
            last_names TEXT,
            honorific TEXT,
            location_id INTEGER,
            FOREIGN KEY(location_id) REFERENCES location(id),
            UNIQUE(names, last_names, location_id)
        );

        CREATE TABLE IF NOT EXISTS room (
            id TEXT PRIMARY KEY,
            name TEXT,
            location_id INTEGER,
            FOREIGN KEY(location_id) REFERENCES location(id),
            UNIQUE(name, location_id)
        );

        CREATE TABLE IF NOT EXISTS class (
            id TEXT PRIMARY KEY,
            course_id INTEGER,
            subject TEXT,
            room_id TEXT,
            professor_id TEXT,
            FOREIGN KEY(course_id) REFERENCES course(id),
            FOREIGN KEY(room_id) REFERENCES room(id),
            FOREIGN KEY(professor_id) REFERENCES professor(id)
        );

        CREATE TABLE IF NOT EXISTS schedule (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_id TEXT,
            day TEXT,
            start_time DATETIME,
            end_time DATETIME,
            FOREIGN KEY(class_id) REFERENCES class(id)
        );
    """)
  conn.commit()


def save_to_db(data, db_path="../../frontend/src/data.db"):
  # Connect to sqlite
  conn = sqlite3.connect(db_path)

  # Drop tables to recreate with new schema cleanly
  cursor = conn.cursor()
  cursor.executescript("""
        DROP TABLE IF EXISTS schedule;
        DROP TABLE IF EXISTS class;
        DROP TABLE IF EXISTS room;
        DROP TABLE IF EXISTS professor;
        DROP TABLE IF EXISTS course;
        DROP TABLE IF EXISTS location;
    """)
  conn.commit()

  init_db(conn)
  cursor = conn.cursor()

  # Caches to avoid redundant SELECTs
  loc_cache = {}
  room_cache = {}
  prof_cache = {}

  for course in data:
    # 1. Insert/Get Location
    campus = getattr(course, "source_campus", None)
    division = getattr(course, "source_division", None)
    hq = getattr(course, "source_headquarters", None)

    campus_val = campus.value if hasattr(campus, "value") else str(campus)
    div_val = division.value if hasattr(division, "value") else str(division)
    hq_val = hq.value if hasattr(hq, "value") else str(hq)

    loc_key = (campus_val, div_val, hq_val)
    if loc_key not in loc_cache:
      cursor.execute(
        "INSERT OR IGNORE INTO location (campus, division, headquarters) VALUES (?,?,?)",
        loc_key,
      )
      cursor.execute(
        "SELECT id FROM location WHERE campus=? AND division=? AND headquarters=?",
        loc_key,
      )
      res = cursor.fetchone()
      if res:
        loc_cache[loc_key] = res[0]

    loc_id = loc_cache.get(loc_key)

    # 2. Insert Course
    cursor.execute(
      "INSERT INTO course (name, location_id, updated_at) VALUES (?, ?, ?)",
      (course.name, loc_id, course.updatedAt),
    )
    course_id = cursor.lastrowid

    # Batch inserts for classes and schedules to speed this up even more
    for cls in course.classes:
      # 3. Insert/Get Room
      r_id = generate_room_id(campus_val, div_val, hq_val, cls.classroom)
      room_key = (cls.classroom, loc_id)
      if room_key not in room_cache:
        cursor.execute(
          "INSERT OR IGNORE INTO room (id, name, location_id) VALUES (?, ?, ?)",
          (r_id, cls.classroom, loc_id),
        )
        room_cache[room_key] = r_id
      room_id_mapped = room_cache[room_key]

      # 4. Insert/Get Professor
      p_id = generate_professor_id(campus_val, div_val, hq_val, cls.professor)
      prof_key = (cls.professor.names, cls.professor.last_names, loc_id)
      if prof_key not in prof_cache:
        cursor.execute(
          "INSERT OR IGNORE INTO professor (id, names, last_names, honorific, location_id) "
          "VALUES (?, ?, ?, ?, ?)",
          (
            p_id,
            cls.professor.names,
            cls.professor.last_names,
            cls.professor.honorific,
            loc_id,
          ),
        )
        prof_cache[prof_key] = p_id
      prof_id = prof_cache[prof_key]

      # 5. Insert Class
      c_id = generate_subject_id(campus_val, div_val, hq_val, course.name, cls.subject)
      cursor.execute(
        "INSERT OR IGNORE INTO class "
        "(id, course_id, subject, room_id, professor_id) VALUES (?, ?, ?, ?, ?)",
        (c_id, course_id, cls.subject, room_id_mapped, prof_id),
      )
      class_id = c_id

      # 6. Insert Schedules (Batched)
      cursor.executemany(
        "INSERT INTO schedule (class_id, day, start_time, end_time) VALUES (?, ?, ?, ?)",
        [
          (
            class_id,
            schedule.day.value,
            schedule.timeRange.from_,
            schedule.timeRange.to,
          )
          for schedule in cls.schedules
        ],
      )

  conn.commit()
  conn.close()
