/**
 * Normalize city names for consistent display and deduplication.
 */

export function normalizeCityName(city) {
  if (!city || typeof city !== 'string') {
    return '';
  }

  const cleaned = city.trim().replace(/\s+/g, ' ');
  if (!cleaned) {
    return '';
  }

  return cleaned
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function cityKey(city) {
  return normalizeCityName(city).toLowerCase();
}

export function citiesMatch(cityA, cityB) {
  const keyA = cityKey(cityA);
  const keyB = cityKey(cityB);
  return Boolean(keyA) && keyA === keyB;
}

export function uniqueNormalizedCities(cities) {
  const seen = new Map();

  for (const city of cities) {
    const key = cityKey(city);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.set(key, normalizeCityName(city));
  }

  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
}
