"""
Estrategia de Deduplicación de Salones:
1. Detección de "outliers" (salones con n < límite de clases).
2. Filtrado de candidatos por similitud de nombre:
   - Reglas manuales dadas por el scraper (custom_rules).
   - Restricciones numéricas (los números exactos en nombre deben coincidir).
   - Distancia de Levenshtein adaptativa.
   - Entrecruzamiento de subconjuntos de palabras limitando ruido.
3. Prueba de colisión: El salón "outlier" se fusiona sólo si 0 de sus horarios coinciden con el salón candidato.
"""

import logging
import re
import unicodedata
from collections import defaultdict


def normalize(txt):
  txt = txt.strip().lower()
  txt = unicodedata.normalize("NFKD", txt)
  return "".join(c for c in txt if not unicodedata.combining(c))


def levenshtein(s1, s2):
  s1, s2 = normalize(s1), normalize(s2)
  if len(s1) < len(s2):
    return levenshtein(s2, s1)
  if len(s2) == 0:
    return len(s1)

  previous_row = range(len(s2) + 1)
  for i, c1 in enumerate(s1):
    current_row = [i + 1]
    for j, c2 in enumerate(s2):
      insertions = previous_row[j + 1] + 1
      deletions = current_row[j] + 1
      substitutions = previous_row[j] + (c1 != c2)
      current_row.append(min(insertions, deletions, substitutions))
    previous_row = current_row
  return previous_row[-1]


def extract_numbers(s):
  return set(re.findall(r"\d+", s))


def can_merge_names(outlier_name, reg_name, custom_rules=None):
  if custom_rules is None:
    custom_rules = []

  norm_outlier = normalize(outlier_name)
  norm_reg = normalize(reg_name)

  for rule_outlier, rule_reg in custom_rules:
    if rule_outlier in norm_outlier and rule_reg in norm_reg:
      return True

  num_o = extract_numbers(outlier_name)
  num_r = extract_numbers(reg_name)

  if num_o or num_r:
    if num_o != num_r:
      if len(num_o) == 1 and len(num_r) == 1:
        n_o, n_r = list(num_o)[0], list(num_r)[0]
        if levenshtein(n_o, n_r) > 1:
          return False
      else:
        return False

  dist = levenshtein(outlier_name, reg_name)
  max_dist = 4 if len(outlier_name) > 10 and len(reg_name) > 10 else 2

  if dist <= max_dist:
    return True

  words_o = set(re.findall(r"\w+", norm_outlier))
  words_r = set(re.findall(r"\w+", norm_reg))
  intersection = words_o.intersection(words_r)

  if intersection and (len(intersection) == len(words_o) or len(intersection) == len(words_r)):
    return True

  return False


def schedules_overlap(sched1, sched2):
  if sched1.day != sched2.day:
    return False
  return max(sched1.timeRange.from_, sched2.timeRange.from_) < min(
    sched1.timeRange.to, sched2.timeRange.to
  )


def has_conflict(classes1, classes2):
  for c1 in classes1:
    for s1 in c1.schedules:
      for c2 in classes2:
        for s2 in c2.schedules:
          if schedules_overlap(s1, s2):
            return True
  return False


def merge_outlier_rooms(courses_data, outlier_threshold=5, custom_rules=None):  # noqa: C901
  if custom_rules is None:
    custom_rules = []

  logging.info("Starting room deduplication...")

  locations_rooms = defaultdict(lambda: defaultdict(list))
  for course in courses_data:
    loc_key = (
      getattr(course, "source_campus", ""),
      getattr(course, "source_division", ""),
      getattr(course, "source_headquarters", ""),
    )
    for cls in course.classes:
      locations_rooms[loc_key][cls.classroom].append(cls)

  merges_done = 0

  for loc_key, room_dict in locations_rooms.items():
    outlier_rooms = {}
    regular_rooms = {}

    for room_name, classes in room_dict.items():
      if len(classes) < outlier_threshold:
        outlier_rooms[room_name] = classes
      else:
        regular_rooms[room_name] = classes

    for outlier_name, outlier_classes in outlier_rooms.items():
      best_match = None
      best_dist = float("inf")

      for reg_name, reg_classes in regular_rooms.items():
        if can_merge_names(outlier_name, reg_name, custom_rules):
          dist = levenshtein(outlier_name, reg_name)
          if dist < best_dist and not has_conflict(outlier_classes, reg_classes):
            best_match = reg_name
            best_dist = dist

      if best_match:
        logging.info(f"Merge: '{outlier_name}' -> '{best_match}'")
        for cls in outlier_classes:
          cls.classroom = best_match
        regular_rooms[best_match].extend(outlier_classes)
        merges_done += 1
      else:
        logging.info(f"Unmerged outlier: '{outlier_name}' ({len(outlier_classes)} classes)")

  logging.info(f"Merged {merges_done} mismatched rooms.")
  return courses_data
