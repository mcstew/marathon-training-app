// All plan distances are stored in miles; conversion happens at display time
// based on the user's units preference.

export type DistanceUnits = 'miles' | 'km';

const KM_PER_MILE = 1.609344;

export function convertMiles(miles: number, units: DistanceUnits): number {
  return units === 'km' ? miles * KM_PER_MILE : miles;
}

// "8" / "12.9" — one decimal max, no trailing .0
export function displayDistanceValue(miles: number, units: DistanceUnits): string {
  const value = convertMiles(miles, units);
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function unitAbbrev(units: DistanceUnits): string {
  return units === 'km' ? 'km' : 'mi';
}

export function unitLong(units: DistanceUnits): string {
  return units === 'km' ? 'Kilometers' : 'Miles';
}

// "8 mi" / "12.9 km"
export function formatDistance(miles: number, units: DistanceUnits): string {
  return `${displayDistanceValue(miles, units)} ${unitAbbrev(units)}`;
}
