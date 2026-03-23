import argparse
import logging
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

from db import save_to_db
from scrapers.index import SCRAPER_REGISTRY

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


def run_all_scrapers(output_path):
  logging.info("Starting to run all scrapers...")
  with ThreadPoolExecutor(max_workers=5) as executor:
    futures = {}
    for scraper_config in SCRAPER_REGISTRY:
      scraper_func = scraper_config.scraper

      if not scraper_func:
        logging.warning(f"No scraper function for {scraper_config.url}")
        continue
      logging.info(f"Dispatching scraper for: {scraper_config.url}")
      future = executor.submit(scraper_func, scraper_config.url)
      futures[future] = scraper_config

    # Collect results
    results = []
    for future in as_completed(futures):
      target_config = futures[future]
      try:
        result = future.result()
        # Add source information to each course
        for course in result:
          course.source_campus = target_config.campus
          course.source_division = target_config.division
          course.source_headquarters = target_config.headquarters
        results.extend(result)
        logging.info(f"Completed scraper for {target_config.url}")
      except Exception as e:
        logging.error(f"Error in scraper for {target_config.url}: {e}")
  return results


if __name__ == "__main__":
  parser = argparse.ArgumentParser()
  
  base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
  default_db_path = os.path.join(base_dir, "frontend", "src", "data.db")

  parser.add_argument(
    "--output",
    "-o",
    help="Output sqlite db file path",
    default=default_db_path,
  )
  args = parser.parse_args()

  logging.info("Starting pipeline...")
  data = run_all_scrapers(args.output)
  logging.info(f"Scraped total of {len(data)} courses.")

  logging.info(f"Saving data to {args.output}...")
  save_to_db(data, db_path=args.output)
  logging.info("Done!")
