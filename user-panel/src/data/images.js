/**
 * Remote imagery (Unsplash CDN). Nothing is downloaded or stored locally.
 * `img(key, width)` returns a sized, compressed URL for responsive use.
 */
const UNSPLASH = 'https://images.unsplash.com/photo-';

export const imageLibrary = {
  handsOnWheel: {
    id: '1449965408869-eaa3f722e40d',
    alt: 'Driver with both hands on the steering wheel during an evening drive',
  },
  driverWithNavigation: {
    id: '1600320254374-ce2d293c324e',
    alt: 'Driver following phone navigation mounted on the dashboard',
  },
  londonBus: {
    id: '1488747279002-c8523379faaa',
    alt: 'Red London bus on Westminster Bridge with the Houses of Parliament behind',
  },
  roadLightTrails: {
    id: '1473042904451-00171c69419d',
    alt: 'Light trails from traffic on a multi-lane road at dusk',
  },
  towerBridge: {
    id: '1533929736458-ca588d08c8be',
    alt: 'Tower Bridge in London on a bright day',
  },
  hatchback: {
    id: '1541899481282-d53bffe3c35d',
    alt: 'Compact hatchback parked on a residential street',
  },
  carOnRoad: {
    id: '1606016159991-dfe4f2746ad5',
    alt: 'White car driving on an open road at sunset',
  },
  londonAerial: {
    id: '1513635269975-59663e0ac1ad',
    alt: 'Aerial view of London and the River Thames',
  },
};

export function img(key, width = 1600, quality = 75) {
  const entry = imageLibrary[key];
  if (!entry) return '';
  return `${UNSPLASH}${entry.id}?auto=format&fit=crop&w=${width}&q=${quality}`;
}

/** srcSet helper for responsive <img> tags. */
export function imgSrcSet(key, widths = [640, 960, 1280, 1920]) {
  return widths.map((w) => `${img(key, w)} ${w}w`).join(', ');
}

export const imgAlt = (key) => imageLibrary[key]?.alt ?? '';
