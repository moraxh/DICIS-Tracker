import json
import os

from utils import professor_id as generate_professor_id
from utils import room_id as generate_room_id
from utils import subject_id as generate_subject_id


def save_to_json(data, output_dir):
  os.makedirs(output_dir, exist_ok=True)

  loc_cache = {}
  room_cache = {}
  prof_cache = {}
  course_cache = {}
  class_cache = {}
  schedules = []

  for course in data:
    campus = getattr(course, "source_campus", None)
    division = getattr(course, "source_division", None)
    hq = getattr(course, "source_headquarters", None)

    campus_val = campus.value if hasattr(campus, "value") else str(campus)
    div_val = division.value if hasattr(division, "value") else str(division)
    hq_val = hq.value if hasattr(hq, "value") else str(hq)

    loc_key = (campus_val, div_val, hq_val)
    if loc_key not in loc_cache:
      loc_id = len(loc_cache) + 1
      loc_cache[loc_key] = loc_id

    location = {
      "locationId": str(loc_cache[loc_key]),
      "campus": campus_val,
      "division": div_val,
      "headquarters": hq_val,
    }

    # Course
    course_key = (course.name, hq_val)
    if course_key not in course_cache:
      course_id = len(course_cache) + 1
      course_cache[course_key] = {
        "id": str(course_id),
        "name": course.name,
        **location,
      }

    course_id = course_cache[course_key]["id"]

    for cls in course.classes:
      # Room
      r_id = generate_room_id(campus_val, div_val, hq_val, cls.classroom)
      if r_id not in room_cache:
        room_cache[r_id] = {"id": r_id, "name": cls.classroom, **location}

      # Professor
      p_id = generate_professor_id(campus_val, div_val, hq_val, cls.professor)
      if p_id not in prof_cache:
        prof_cache[p_id] = {
          "id": p_id,
          "fullName": f"{cls.professor.names} {cls.professor.last_names}".strip(),
          "honorific": cls.professor.honorific,
          **location,
        }

      # Class
      c_id = generate_subject_id(campus_val, div_val, hq_val, course.name, cls.subject)
      if c_id not in class_cache:
        class_cache[c_id] = {
          "id": c_id,
          "name": cls.subject,
          "courseName": course.name,
          "courseId": course_id,
          "professor": prof_cache[p_id]["fullName"],
          "honorific": cls.professor.honorific,
          "professorId": p_id,
          "roomName": cls.classroom,
          "roomId": r_id,
          **location,
        }

      # Schedules
      for schedule in cls.schedules:
        schedules.append(
          {
            "day": schedule.day.value,
            "start": schedule.timeRange.from_.strftime("%H:%M"),
            "end": schedule.timeRange.to.strftime("%H:%M"),
            "subjectId": c_id,
            "subjectName": cls.subject,
            "courseName": course.name,
            "professorId": p_id,
            "professorName": prof_cache[p_id]["fullName"],
            "professorHonorific": cls.professor.honorific,
            "roomId": r_id,
            "roomName": cls.classroom,
            "courseId": course_id,
            **location,
          }
        )

  professors = sorted(prof_cache.values(), key=lambda x: x["fullName"])
  rooms = sorted(room_cache.values(), key=lambda x: x["name"])
  courses = sorted(course_cache.values(), key=lambda x: x["name"])
  subjects = sorted(class_cache.values(), key=lambda x: x["name"])

  def write(name, obj):
    return open(os.path.join(output_dir, name), "w").write(json.dumps(obj))

  write("professors.json", professors)
  write("rooms.json", rooms)
  write("courses.json", courses)
  write("subjects.json", subjects)
  write("classes.json", schedules)

  print(
    f"Exported: {len(professors)} professors, {len(rooms)} rooms, "
    f"{len(courses)} courses, {len(subjects)} subjects, {len(schedules)} schedule entries"
  )
