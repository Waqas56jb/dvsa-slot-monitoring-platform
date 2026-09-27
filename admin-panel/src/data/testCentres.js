import { createRandom, ago, MINUTE, HOUR, DAY } from '@/lib/mock'

const r = createRandom(11)

// [name, city, region, postcode, street, lat, lng]
const CENTRES = [
  ['Wood Green', 'London', 'London', 'N22 6HH', 'Station Road', 51.597, -0.109],
  ['Mill Hill', 'London', 'London', 'NW7 3SA', 'Bunns Lane', 51.612, -0.236],
  ['Hendon', 'London', 'London', 'NW9 5EX', 'Aerodrome Road', 51.597, -0.237],
  ['Morden', 'London', 'London', 'SM4 5DX', 'Crown Lane', 51.402, -0.195],
  ['Mitcham', 'London', 'London', 'CR4 4NA', 'Streatham Road', 51.410, -0.157],
  ['Tolworth', 'London', 'London', 'KT6 7EL', 'Hook Rise South', 51.378, -0.282],
  ['Isleworth', 'London', 'London', 'TW7 4DY', 'Bridge Road', 51.470, -0.334],
  ['Hither Green', 'London', 'London', 'SE13 6TE', 'Staplehurst Road', 51.451, -0.001],
  ['Barking', 'London', 'London', 'IG11 0DR', 'Rippleside', 51.531, 0.108],
  ['Goodmayes', 'London', 'London', 'IG3 8XJ', 'Goodmayes Road', 51.566, 0.111],
  ['Wanstead', 'London', 'London', 'E11 2BN', 'Woodbine Place', 51.575, 0.028],
  ['Chingford', 'London', 'London', 'E4 8SN', 'Larkshall Road', 51.622, 0.002],
  ['Belvedere', 'London', 'London', 'DA17 6AA', 'Crabtree Manorway', 51.491, 0.155],
  ['Sidcup', 'London', 'London', 'DA14 6LP', 'Main Road', 51.427, 0.103],
  ['Southall', 'London', 'London', 'UB2 4SE', 'Bridge Road', 51.505, -0.376],
  ['Greenford', 'London', 'London', 'UB6 8UW', 'Oldfield Lane', 51.528, -0.352],
  ['Pinner', 'London', 'London', 'HA5 5DY', 'Cannon Lane', 51.584, -0.380],
  ['Enfield', 'London', 'London', 'EN3 7QN', 'Brimsdown Avenue', 51.655, -0.025],
  ['Borehamwood', 'Borehamwood', 'East of England', 'WD6 1WA', 'Elstree Way', 51.656, -0.271],
  ['Loughton', 'Loughton', 'East of England', 'IG10 3HQ', 'Langston Road', 51.646, 0.083],
  ['Reading', 'Reading', 'South East', 'RG2 0SL', 'Basingstoke Road', 51.431, -0.978],
  ['Guildford', 'Guildford', 'South East', 'GU1 1RL', 'Woodbridge Meadows', 51.243, -0.581],
  ['Brighton', 'Brighton', 'South East', 'BN2 4PT', 'Warren Road', 50.832, -0.098],
  ['Oxford (Cowley)', 'Oxford', 'South East', 'OX4 6NH', 'Garsington Road', 51.736, -1.206],
  ['Cambridge', 'Cambridge', 'East of England', 'CB1 3PH', 'Brookmount Court', 52.193, 0.145],
  ['Bristol (Kingswood)', 'Bristol', 'South West', 'BS15 8JD', 'Station Road', 51.458, -2.508],
  ['Birmingham (Kingstanding)', 'Birmingham', 'West Midlands', 'B44 9TL', 'Kingstanding Road', 52.546, -1.880],
  ['Nottingham (Colwick)', 'Nottingham', 'East Midlands', 'NG4 2AE', 'Private Road No. 7', 52.957, -1.089],
  ['Manchester (Cheetham Hill)', 'Manchester', 'North West', 'M8 8SH', 'Cheetham Hill Road', 53.503, -2.238],
  ['Liverpool (Norris Green)', 'Liverpool', 'North West', 'L11 2SZ', 'Broad Lane', 53.445, -2.924],
  ['Leeds (Horsforth)', 'Leeds', 'Yorkshire', 'LS18 4RL', 'Low Lane', 53.844, -1.636],
  ['Sheffield (Middlewood)', 'Sheffield', 'Yorkshire', 'S6 1TQ', 'Middlewood Road', 53.415, -1.519],
  ['Newcastle (Gosforth)', 'Newcastle upon Tyne', 'North East', 'NE3 3DJ', 'Hollywood Avenue', 55.010, -1.622],
  ['Glasgow (Anniesland)', 'Glasgow', 'Scotland', 'G13 1ES', 'Crow Road', 55.890, -4.320],
  ['Edinburgh (Musselburgh)', 'Edinburgh', 'Scotland', 'EH21 7PQ', 'Olivebank Road', 55.943, -3.056],
  ['Cardiff (Llanishen)', 'Cardiff', 'Wales', 'CF14 5GL', 'Ty Glas Avenue', 51.528, -3.187],
]

const code = (name, i) => {
  const base = name.replace(/\(.*?\)/g, '').replace(/[^A-Za-z ]/g, '').trim().split(/\s+/)
  const letters = base.length > 1 ? base.map((w) => w[0]).join('') : base[0].slice(0, 3)
  return `TC-${letters.toUpperCase()}${String(100 + i * 7).slice(-3)}`
}

export const testCentres = CENTRES.map(([name, city, region, postcode, street, lat, lng], i) => {
  const inactive = [12, 29].includes(i)
  const demand = region === 'London' ? r.int(55, 98) : r.int(20, 75)
  return {
    id: `ctr_${String(i + 1).padStart(3, '0')}`,
    name: `${name} Driving Test Centre`,
    shortName: name,
    city,
    region,
    code: code(name, i),
    address: `${r.int(2, 180)} ${street}, ${city}, ${postcode}`,
    postcode,
    coordinates: { lat, lng },
    status: inactive ? 'Inactive' : 'Active',
    monitoringJobs: 0, // filled by monitoring.js
    slotsDetected: 0, // filled by slots.js
    slotsDetected7d: 0,
    lastChecked: inactive ? ago(r.int(2, 9) * DAY) : ago(r.int(10, 240) * 1000),
    availability: inactive ? 'None' : r.weighted([['Low', 5], ['Medium', 3], ['High', 1]]),
    demandScore: demand,
    avgWaitWeeks: region === 'London' ? r.int(14, 24) : r.int(6, 18),
    checkInterval: r.pick([60, 90, 120]),
    createdAt: ago(r.int(200, 520) * DAY),
    updatedAt: ago(r.int(1, 40) * DAY + r.int(1, 20) * HOUR + r.int(1, 50) * MINUTE),
    notes: '',
  }
})

export const centreById = (id) => testCentres.find((c) => c.id === id)
export const activeCentres = () => testCentres.filter((c) => c.status === 'Active')
