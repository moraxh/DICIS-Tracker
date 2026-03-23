import hashlib
import unicodedata
from datetime import datetime as dt


def clean(text):
  if not text:
    return ""
  return " ".join(str(text).split())


def safe_parse_time(value):
  if not value:
    return None
  try:
    return dt.strptime(value.strip(), "%H:%M")
  except Exception:
    return None


def normalize(txt):
  txt = txt.strip().lower()
  txt = unicodedata.normalize("NFKD", txt)
  txt = "".join(c for c in txt if not unicodedata.combining(c))
  return txt


def generate_hash(txt):
  txt = normalize(txt)
  return hashlib.sha256(txt.encode("utf-8")).hexdigest()


def subject_id(campus, division, headquarters, course_name, subject):
  base = f"{course_name}|{subject}"
  return generate_hash(base)


def professor_id(campus, division, headquarters, professor):
  base = f"{professor.honorific}|{professor.names}|{professor.last_names}"
  return generate_hash(base)


def room_id(campus, division, headquarters, room):
  return generate_hash(room)
