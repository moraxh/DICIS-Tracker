import logging
import tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin

import pdfplumber
import requests
from bs4 import BeautifulSoup

from room_merger import merge_outlier_rooms
from utils import clean, safe_parse_time

from .index import Class, Course, Day, Professor, Schedule, TimeRange

filtered_rooms_names = {
  "Biblioteca",
  "Virtual",
  "Teams",
  "Canchas",
}


def is_valid_room(name):
  if not name:
    return False

  name = name.lower().strip()

  if len(name) < 2:
    return False

  for fr in filtered_rooms_names:
    if fr.lower() in name:
      return False

  return True


def format_professor(name):
  name = clean(name)

  parts = name.split(",")

  name_parts = parts[0].split()

  last_names = " ".join(name_parts[:2]).title()
  names = " ".join(name_parts[2:]).title()

  honorific = parts[1].strip() if len(parts) > 1 else ""

  return Professor(names=names, last_names=last_names, honorific=honorific)


def extract_days(headers):
  mapping = {}

  for i, h in enumerate(headers):
    if not h:
      continue

    h = h.upper()

    if "LUN" in h and Day.MONDAY not in mapping:
      mapping[Day.MONDAY] = (i, i + 1)
    elif "MAR" in h and Day.TUESDAY not in mapping:
      mapping[Day.TUESDAY] = (i, i + 1)
    elif ("MIÉ" in h or "MIE" in h) and Day.WEDNESDAY not in mapping:
      mapping[Day.WEDNESDAY] = (i, i + 1)
    elif "JUE" in h and Day.THURSDAY not in mapping:
      mapping[Day.THURSDAY] = (i, i + 1)
    elif "VIE" in h and Day.FRIDAY not in mapping:
      mapping[Day.FRIDAY] = (i, i + 1)
    elif ("SÁB" in h or "SAB" in h) and Day.SATURDAY not in mapping:
      mapping[Day.SATURDAY] = (i, i + 1)

  return mapping


def get_pdf_links(url: str):
  with requests.Session() as session:
    res = session.get(url, timeout=10)
    res.raise_for_status()

    soup = BeautifulSoup(res.text, "html.parser")

    title = soup.find(string=lambda t: t and "Sede Salamanca Enero" in t)

    if not title:
      raise Exception("No se encontró Salamanca")

    container = title.find_parent("td")
    table = container.find("table")

    anchors = []

    for a in table.find_all("a", href=True):
      href = a["href"]

      if href.lower().endswith(".pdf"):
        anchors.append({"name": a.text.strip(), "href": urljoin(url, href)})

    return anchors


def parse_pdf(url, name):
  logging.info(f"Downloading {name}")

  with requests.Session() as session:
    res = session.get(url, timeout=20)
    res.raise_for_status()

    with tempfile.NamedTemporaryFile(suffix=".pdf") as tmp:
      tmp.write(res.content)
      tmp.flush()

      classes = []

      with pdfplumber.open(tmp.name) as pdf:
        for page in pdf.pages:
          tables = page.extract_tables()

          if not tables:
            continue

          for t in tables:
            try:
              classes.extend(parse_table(t))
            except Exception as e:
              logging.warning(f"Table parse failed: {e}")

      return Course(name=name, classes=classes, updatedAt=None)


def parse_table(table):
  if not table or len(table) < 2:
    return []

  headers = [clean(h).upper() if h else "" for h in table[0]]
  rows = table[1:]

  try:
    subject_idx = headers.index("UDA")
    room_idx = headers.index("AULA")
    prof_idx = headers.index("PROFESOR")
  except ValueError:
    return []

  days_map = extract_days(headers)

  grouped = {}

  for row in rows:
    subject = clean(row[subject_idx])
    room = clean(row[room_idx])
    prof_raw = clean(row[prof_idx])

    if not subject or not room:
      continue

    # Filter generic 'zones' or invalid rooms out of the actual schema
    if not is_valid_room(room):
      continue

    prof = format_professor(prof_raw)

    key = (subject, room, prof_raw)

    if key not in grouped:
      grouped[key] = Class(subject=subject, classroom=room, professor=prof, schedules=[])

    for day, (start_i, end_i) in days_map.items():
      if end_i < len(row):
        start = safe_parse_time(row[start_i])
        end = safe_parse_time(row[end_i])

        if start and end:
          grouped[key].schedules.append(Schedule(day=day, timeRange=TimeRange(start, end)))

  return list(grouped.values())


def scraper_dicis_salamanca(url: str) -> list[Course]:
  anchors = get_pdf_links(url)
  courses = []

  with ThreadPoolExecutor(max_workers=5) as executor:
    # Submit all PDF parsing jobs to the thread pool
    future_to_anchor = {executor.submit(parse_pdf, a["href"], a["name"]): a for a in anchors}

    for future in as_completed(future_to_anchor):
      a = future_to_anchor[future]
      try:
        course = future.result()
        if course:
          courses.append(course)
      except Exception as e:
        logging.warning(f"Failed to parse {a['name']}: {e}")

  dicis_rules = [("cdmanu", "manufactura"), ("computo", "comp. a")]
  courses = merge_outlier_rooms(courses, outlier_threshold=5, custom_rules=dicis_rules)

  return courses
