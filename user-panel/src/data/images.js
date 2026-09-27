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
  // — Landing page (verified Unsplash IDs) —
  westminsterBridge: { id: '1505761671935-60b3a7427bad', alt: 'Westminster Bridge and Big Ben over the Thames' },
  bigBenSunset: { id: '1529655683826-aba9b3e77383', alt: 'Big Ben silhouetted against a sunset sky' },
  towerBridgeDusk: { id: '1454537468202-b7ff71d51c2e', alt: 'Tower Bridge lit up at dusk' },
  shardSkyline: { id: '1543832923-44667a44c804', alt: 'The Shard and Tower Bridge at golden hour' },
  parliament: { id: '1486299267070-83823f5448dd', alt: 'Houses of Parliament and Elizabeth Tower on a clear day' },
  bigBenBus: { id: '1520986606214-8b456906c813', alt: 'Red double-decker bus passing Big Ben' },
  bigBenStatue: { id: '1500380804539-4e1e8c1e7118', alt: 'Elizabeth Tower rising above a bronze statue' },
  edinburgh: { id: '1506377585622-bedcbb027afc', alt: 'Edinburgh skyline with the castle at sunset' },
  greenHills: { id: '1470071459604-3b5ec3a7fe05', alt: 'Rolling green hills under a dramatic sky' },
  fiatStreet: { id: '1549317661-bd32c8ce0db2', alt: 'Small blue hatchback parked on a quiet English street' },
  beetle: { id: '1489824904134-891ab64532f1', alt: 'Classic orange car parked beside a modern building' },
  cockpitMotion: { id: '1485463611174-f302f6a5c1c9', alt: 'View from the driver seat with motion-blurred road ahead' },
  nightSportsCar: { id: '1503376780353-7e6692767b70', alt: 'Car driving along a road at dusk' },
  headlights: { id: '1533106418989-88406c7cc8ca', alt: 'Car with headlights on in a dark garage' },
  motorbike: { id: '1558981806-ec527fa84c39', alt: 'Motorcyclist riding along a coastal road at sunset' },
  forestRoad: { id: '1476231682828-37e571bc172f', alt: 'Aerial view of a road winding through a forest' },
  interchange: { id: '1465447142348-e9952c393450', alt: 'Aerial view of a motorway interchange' },
  phoneApps: { id: '1512941937669-90a1b58e7e9c', alt: 'Smartphone showing a home screen of apps' },
  studioDesk: { id: '1551434678-e076c223a692', alt: 'Team working at desks in a bright office' },
  teamTable: { id: '1522071820081-009f0129c71c', alt: 'Small team collaborating around a table with laptops' },
  schoolOffice: { id: '1556761175-5973dc0f32e7', alt: 'Team meeting in a relaxed modern office' },
  portraitAmelia: { id: '1494790108377-be9c29b29330', alt: 'Smiling young woman' },
  portraitDaniel: { id: '1500648767791-00dcc994a43e', alt: 'Smiling man in his thirties' },
  portraitSophie: { id: '1438761681033-6461ffad8d80', alt: 'Young woman by a lake' },
  portraitMark: { id: '1472099645785-5658abf4ff4e', alt: 'Middle-aged man with glasses' },
  portraitPriya: { id: '1544005313-94ddf0286df2', alt: 'Young woman with long hair' },
  portraitJames: { id: '1506794778202-cad84cf45f1d', alt: 'Man with a beard' },
  portraitChloe: { id: '1517841905240-472988babdf9', alt: 'Young woman in a denim jacket smiling' },
  portraitHelen: { id: '1573496359142-b8d87734a5a2', alt: 'Professional woman in a blazer' },
  portraitOmar: { id: '1560250097-0b93528c311a', alt: 'Professional man in a suit' },
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
