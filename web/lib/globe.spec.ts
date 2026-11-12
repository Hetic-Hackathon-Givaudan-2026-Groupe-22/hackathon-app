import { describe, expect, it } from 'vitest';
import { estTerre, pointsDeTerre, projeter, slerp, vec, VILLES } from './globe';

describe('globe (US-08)', () => {
  it('Paris est sur la terre, le milieu de l’Atlantique non', () => {
    expect(estTerre(...VILLES.Paris)).toBe(true);
    expect(estTerre(30, -40)).toBe(false);
  });

  it('les points de terre sont sur la sphère unité', () => {
    const pts = pointsDeTerre(6);
    expect(pts.length).toBeGreaterThan(50);
    for (const [x, y, z] of pts.slice(0, 20)) {
      expect(Math.hypot(x, y, z)).toBeCloseTo(1, 6);
    }
  });

  it('le point regardé est au centre et visible ; son antipode est caché', () => {
    const [x, y, d] = projeter(vec(30, 20), 20, 30, 100, 100, 50);
    expect(x).toBeCloseTo(100, 6);
    expect(y).toBeCloseTo(100, 6);
    expect(d).toBeCloseTo(1, 6);
    expect(projeter(vec(-30, -160), 20, 30, 100, 100, 50)[2]).toBeLessThan(0);
  });

  it('slerp part de a et arrive à b', () => {
    const a = vec(...VILLES.Tokyo);
    const b = vec(...VILLES.Paris);
    slerp(a, b, 0).forEach((c, i) => expect(c).toBeCloseTo(a[i], 6));
    slerp(a, b, 1).forEach((c, i) => expect(c).toBeCloseTo(b[i], 6));
  });

  it('chaque ville connue a des coordonnées plausibles', () => {
    for (const [la, lo] of Object.values(VILLES)) {
      expect(Math.abs(la)).toBeLessThanOrEqual(90);
      expect(Math.abs(lo)).toBeLessThanOrEqual(180);
    }
  });
});
