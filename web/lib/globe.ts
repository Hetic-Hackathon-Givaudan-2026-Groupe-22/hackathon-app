// Géométrie du globe (ADR 0014), reprise du prototype : fonctions pures, testées

const D = Math.PI / 180;

export type Vec3 = [number, number, number];

// Villes de départ et d'arrivée des tendances, [latitude, longitude]
export const VILLES: Record<string, [number, number]> = {
  Séoul: [37.6, 127],
  Tokyo: [35.7, 139.7],
  Manille: [14.6, 121],
  Dubaï: [25.2, 55.3],
  Marrakech: [31.6, -8],
  Londres: [51.5, -0.1],
  Paris: [48.9, 2.35],
  Berlin: [52.5, 13.4],
  Madrid: [40.4, -3.7],
  'New York': [40.7, -74],
  'Los Angeles': [34, -118.2],
};

// Continents simplifiés du prototype, en [longitude, latitude]
const CONTINENTS: [number, number][][] = [
  [
    [-168, 65],
    [-140, 70],
    [-95, 72],
    [-75, 62],
    [-60, 50],
    [-67, 45],
    [-75, 35],
    [-81, 25],
    [-97, 18],
    [-90, 15],
    [-83, 9],
    [-80, 8],
    [-105, 20],
    [-117, 32],
    [-125, 42],
    [-125, 49],
    [-140, 59],
    [-160, 58],
  ],
  [
    [-50, 60],
    [-40, 65],
    [-20, 70],
    [-25, 80],
    [-60, 82],
    [-70, 76],
    [-55, 68],
  ],
  [
    [-80, 9],
    [-60, 10],
    [-50, 0],
    [-35, -7],
    [-40, -22],
    [-48, -28],
    [-58, -38],
    [-65, -55],
    [-72, -50],
    [-75, -40],
    [-71, -18],
    [-81, -5],
  ],
  [
    [-10, 36],
    [-9, 43],
    [-2, 44],
    [-5, 48],
    [2, 51],
    [5, 53],
    [8, 57],
    [5, 62],
    [15, 69],
    [28, 71],
    [40, 67],
    [45, 55],
    [40, 45],
    [28, 41],
    [22, 37],
    [15, 38],
    [12, 44],
    [8, 44],
    [3, 43],
    [-1, 37],
  ],
  [
    [-6, 50],
    [1, 51],
    [2, 53],
    [-2, 57],
    [-5, 58],
    [-6, 55],
    [-3, 53],
  ],
  [
    [-17, 15],
    [-17, 21],
    [-10, 30],
    [-6, 36],
    [10, 37],
    [20, 32],
    [32, 31],
    [34, 28],
    [43, 12],
    [51, 12],
    [40, -2],
    [40, -15],
    [33, -26],
    [20, -35],
    [15, -28],
    [12, -17],
    [9, -1],
    [9, 4],
    [-8, 4],
    [-13, 8],
  ],
  [
    [28, 41],
    [36, 36],
    [35, 32],
    [43, 13],
    [52, 17],
    [58, 22],
    [57, 26],
    [50, 30],
    [62, 25],
    [67, 24],
    [72, 20],
    [77, 8],
    [80, 15],
    [88, 22],
    [92, 20],
    [98, 16],
    [100, 7],
    [104, 2],
    [105, 10],
    [109, 12],
    [107, 21],
    [118, 24],
    [122, 31],
    [120, 38],
    [126, 38],
    [130, 42],
    [140, 50],
    [143, 59],
    [155, 59],
    [163, 62],
    [180, 67],
    [180, 72],
    [140, 73],
    [110, 77],
    [80, 73],
    [68, 69],
    [60, 70],
    [45, 68],
    [40, 67],
    [45, 55],
    [40, 45],
  ],
  [
    [130, 31],
    [135, 34],
    [141, 36],
    [142, 43],
    [145, 44],
    [140, 40],
    [136, 36],
  ],
  [
    [114, -22],
    [122, -18],
    [130, -12],
    [137, -12],
    [142, -11],
    [146, -19],
    [153, -25],
    [150, -37],
    [141, -38],
    [135, -34],
    [129, -31],
    [115, -34],
  ],
  [
    [95, 5],
    [105, -6],
    [115, -8],
    [120, -9],
    [141, -9],
    [150, -10],
    [140, -3],
    [120, 1],
    [110, 1],
    [100, 2],
  ],
  [
    [44, -12],
    [50, -15],
    [49, -25],
    [44, -24],
  ],
  [
    [166, -46],
    [174, -41],
    [178, -38],
    [172, -34],
    [168, -44],
  ],
];

export function vec(lat: number, lon: number): Vec3 {
  return [
    Math.cos(lat * D) * Math.cos(lon * D),
    Math.cos(lat * D) * Math.sin(lon * D),
    Math.sin(lat * D),
  ];
}

function dansPolygone(lon: number, lat: number, p: [number, number][]) {
  let dedans = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i];
    const [xj, yj] = p[j];
    if (
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    )
      dedans = !dedans;
  }
  return dedans;
}

export function estTerre(lat: number, lon: number): boolean {
  return CONTINENTS.some((p) => dansPolygone(lon, lat, p));
}

// Points de terre, un tous les ~2 degrés : calculés une fois
export function pointsDeTerre(pas = 2): Vec3[] {
  const pts: Vec3[] = [];
  for (let la = -56; la <= 82; la += pas)
    for (let lo = -180; lo < 180; lo += pas / Math.max(0.3, Math.cos(la * D)))
      if (estTerre(la, lo)) pts.push(vec(la, lo));
  return pts;
}

// Projection orthographique centrée sur (latC, lonC) : [x, y, profondeur > 0 si visible]
export function projeter(
  v: Vec3,
  lonC: number,
  latC: number,
  cx: number,
  cy: number,
  R: number,
  k = 1,
): [number, number, number] {
  const cl = Math.cos(lonC * D);
  const sl = Math.sin(lonC * D);
  const cf = Math.cos(latC * D);
  const sf = Math.sin(latC * D);
  const x1 = v[0] * cl + v[1] * sl;
  const y1 = -v[0] * sl + v[1] * cl;
  const dep = x1 * cf + v[2] * sf;
  const z2 = -x1 * sf + v[2] * cf;
  return [cx + R * y1 * k, cy - R * z2 * k, dep];
}

// Point entre a et b sur le grand cercle, t de 0 à 1
export function slerp(a: Vec3, b: Vec3, t: number): Vec3 {
  const dot = Math.max(
    -1,
    Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]),
  );
  const om = Math.acos(dot);
  const so = Math.sin(om) || 1e-6;
  const s1 = Math.sin((1 - t) * om) / so;
  const s2 = Math.sin(t * om) / so;
  return [a[0] * s1 + b[0] * s2, a[1] * s1 + b[1] * s2, a[2] * s1 + b[2] * s2];
}
