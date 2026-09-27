/**
 * Sample test-centre records for the frontend demo.
 * These are NOT live availability data — the backend will supply the
 * authoritative centre list once it is connected.
 */
export const centres = [
  { id: 'ctr_hammersmith', name: 'Hammersmith', region: 'London', area: 'West London', postcode: 'W6' },
  { id: 'ctr_southall', name: 'Southall', region: 'London', area: 'West London', postcode: 'UB2' },
  { id: 'ctr_isleworth', name: 'Isleworth', region: 'London', area: 'West London', postcode: 'TW7' },
  { id: 'ctr_enfield', name: 'Enfield', region: 'London', area: 'North London', postcode: 'EN3' },
  { id: 'ctr_barking', name: 'Barking', region: 'London', area: 'East London', postcode: 'IG11' },
  { id: 'ctr_hendon', name: 'Hendon', region: 'London', area: 'North London', postcode: 'NW4' },
  { id: 'ctr_millhill', name: 'Mill Hill', region: 'London', area: 'North London', postcode: 'NW7' },
  { id: 'ctr_sutton', name: 'Sutton', region: 'London', area: 'South London', postcode: 'SM1' },
  { id: 'ctr_croydon', name: 'Croydon', region: 'London', area: 'South London', postcode: 'CR0' },
  { id: 'ctr_bromley', name: 'Bromley', region: 'London', area: 'South London', postcode: 'BR1' },
  { id: 'ctr_woodgreen', name: 'Wood Green', region: 'London', area: 'North London', postcode: 'N22' },
  { id: 'ctr_goodmayes', name: 'Goodmayes', region: 'London', area: 'East London', postcode: 'IG3' },
  { id: 'ctr_wanstead', name: 'Wanstead', region: 'London', area: 'East London', postcode: 'E11' },
  { id: 'ctr_morden', name: 'Morden', region: 'London', area: 'South London', postcode: 'SM4' },
  { id: 'ctr_greenford', name: 'Greenford', region: 'London', area: 'West London', postcode: 'UB6' },
  { id: 'ctr_hornchurch', name: 'Hornchurch', region: 'London', area: 'East London', postcode: 'RM12' },
  { id: 'ctr_kingsheath', name: 'Kings Heath', region: 'Midlands', area: 'Birmingham', postcode: 'B14' },
  { id: 'ctr_garretts', name: 'Garretts Green', region: 'Midlands', area: 'Birmingham', postcode: 'B26' },
  { id: 'ctr_cheetham', name: 'Cheetham Hill', region: 'North West', area: 'Manchester', postcode: 'M8' },
  { id: 'ctr_westdidsbury', name: 'West Didsbury', region: 'North West', area: 'Manchester', postcode: 'M20' },
  { id: 'ctr_horsforth', name: 'Horsforth', region: 'Yorkshire', area: 'Leeds', postcode: 'LS18' },
  { id: 'ctr_avonmouth', name: 'Avonmouth', region: 'South West', area: 'Bristol', postcode: 'BS11' },
  { id: 'ctr_reading', name: 'Reading', region: 'South East', area: 'Berkshire', postcode: 'RG2' },
  { id: 'ctr_luton', name: 'Luton', region: 'East of England', area: 'Bedfordshire', postcode: 'LU2' },
];

export const centreRegions = [...new Set(centres.map((c) => c.region))];

/** Centres highlighted in marketing mock-ups. */
export const featuredLondonCentres = [
  'ctr_hammersmith', 'ctr_southall', 'ctr_isleworth', 'ctr_enfield', 'ctr_barking',
  'ctr_hendon', 'ctr_millhill', 'ctr_sutton', 'ctr_croydon', 'ctr_bromley',
];
