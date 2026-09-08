import logging
import tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Iterable
from urllib.parse import urljoin

import pdfplumber
import requests
from bs4 import BeautifulSoup

from room_merger import merge_outlier_rooms
from utils import clean, safe_parse_time

from .index import Class, Course, Day, Professor, Schedule, TimeRange

MONTH_NAMES = {
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
}

filtered_rooms_names = {
  "Biblioteca",
  "Virtual",
  "Teams",
  "Canchas",
  "En línea",
  "En linea",
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


def normalize_room(name):
  room = clean(name)
  normalized = room.casefold()

  if normalized == "aula posgrado" or normalized == "aula de posgrado":
    return "Aula Posgrado"

  return room


def should_skip_subject(name):
  subject = clean(name).casefold()
  return "actividad complementaria" in subject


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


def discover_sections(url: str):
  """Find every 'Sede <headquarters> ...' section title on the page.

  Section titles carry a trailing academic-term qualifier that changes every
  cycle (e.g. "Sede Salamanca Agosto - Diciembre 2026") and, as of the 2026
  cycle, a headquarters can have more than one such section live at once
  (undergrad and graduate programs listed separately). Rather than matching
  fixed prefixes that need updating whenever the site's section naming
  changes, this scans the whole page for anything starting with "Sede " and
  returns every match, grouped by headquarters name.
  """
  with requests.Session() as session:
    res = session.get(url, timeout=10)
    res.raise_for_status()

    soup = BeautifulSoup(res.text, "html.parser")

    titles = soup.find_all(string=lambda t: t and clean(t).startswith("Sede "))

    sections = {}

    for title in titles:
      full_title = clean(title)
      # Headquarters name is the text right after "Sede " up to the next
      # qualifier word (a term month or a date range), e.g. "Salamanca" out
      # of "Sede Salamanca Agosto - Diciembre 2026".
      rest = full_title[len("Sede ") :]
      words = rest.split()

      name_words = []
      for w in words:
        if w.casefold() in MONTH_NAMES or any(c.isdigit() for c in w) or w == "-":
          break
        name_words.append(w)

      headquarters = " ".join(name_words) if name_words else rest

      sections.setdefault(headquarters, []).append(title)

    return sections


def get_pdf_links_for_headquarters(url: str, headquarters: str):
  sections = discover_sections(url)

  matches = [title for name, titles in sections.items() if name == headquarters for title in titles]

  if not matches:
    available = ", ".join(sorted(sections)) or "(ninguna)"
    raise Exception(
      f"No se encontró la sede '{headquarters}' en la página. Sedes disponibles: {available}"
    )

  anchors = []

  for title in matches:
    table = title.find_next("table")

    if not table:
      continue

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
    room = normalize_room(row[room_idx])
    prof_raw = clean(row[prof_idx])

    if not subject or not room:
      continue

    if should_skip_subject(subject):
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


def scrape_courses(
  url: str,
  headquarters: str,
  custom_rules: Iterable[tuple[str, str]] | None = None,
):
  anchors = get_pdf_links_for_headquarters(url, headquarters)

  if not anchors:
    raise Exception(f"La sede '{headquarters}' no tiene PDFs de horarios listados")

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

  courses = merge_outlier_rooms(
    courses,
    outlier_threshold=5,
    custom_rules=list(custom_rules or []),
  )

  return courses


def scraper_dicis_salamanca(url: str) -> list[Course]:
  dicis_rules = [("cdmanu", "manufactura"), ("computo", "comp. a")]
  return scrape_courses(url, "Salamanca", custom_rules=dicis_rules)


def scraper_dicis_yuriria(url: str) -> list[Course]:
  return scrape_courses(url, "Yuriria")
