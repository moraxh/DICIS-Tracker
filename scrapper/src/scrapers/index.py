from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Callable


class Day(str, Enum):
  MONDAY = "MONDAY"
  TUESDAY = "TUESDAY"
  WEDNESDAY = "WEDNESDAY"
  THURSDAY = "THURSDAY"
  FRIDAY = "FRIDAY"
  SATURDAY = "SATURDAY"


@dataclass
class TimeRange:
  from_: datetime
  to: datetime


@dataclass
class Schedule:
  day: Day
  timeRange: TimeRange


@dataclass
class Professor:
  names: str
  last_names: str
  honorific: str


@dataclass
class Class:
  subject: str
  classroom: str
  professor: Professor
  schedules: list[Schedule] = field(default_factory=list)


@dataclass
class Course:
  name: str
  classes: list[Class]
  updatedAt: datetime | None


class Campus(str, Enum):
  IRAPUATO_SALAMANCA = "Irapuato - Salamanca"
  GUANAJUATO = "Guanajuato"
  LEON = "León"
  CELAYA_SALVATIERRA = "Celaya - Salvatierra"


class Division(str, Enum):
  DICIS = "DICIS"
  DICIVA = "DICIVA"


class Headquarters(str, Enum):
  SALAMANCA = "Salamanca"
  IRAPUATO = "Irapuato"


@dataclass
class ScraperConfig:
  campus: Campus
  division: Division
  headquarters: Headquarters
  url: str
  scraper: Callable[..., list[Course]]


from .dicis_salamanca import scraper_dicis_salamanca  # noqa: E402

SCRAPER_REGISTRY = [
  ScraperConfig(
    campus=Campus.IRAPUATO_SALAMANCA,
    division=Division.DICIS,
    headquarters=Headquarters.SALAMANCA,
    url="http://www.caecis.ugto.mx/caecis/pages/horarios.aspx",
    scraper=scraper_dicis_salamanca,
  )
]
