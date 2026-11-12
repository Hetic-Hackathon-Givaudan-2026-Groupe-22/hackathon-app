'use client';

import { useEffect, useRef, useState } from 'react';
import type { TendanceResume } from '@/lib/api';
import { couleurFamille, statutTendance } from '@/lib/famille';
import { LegendeGlobe } from './legende';
import {
  pointsDeTerre,
  projeter,
  slerp,
  vec,
  VILLES,
  type Vec3,
} from '@/lib/globe';

type Infobulle = { x: number; y: number; t: TendanceResume };

const TERRE = pointsDeTerre(1.6);

// US-08 : le globe du prototype, en Canvas 2D (ADR 0014). Il tourne à la souris
// et au doigt ; le survol d'une tendance affiche son nom, son statut et ses pays.
export function Globe({ tendances }: { tendances: TendanceResume[] }) {
  const boite = useRef<HTMLDivElement>(null);
  const toile = useRef<HTMLCanvasElement>(null);
  const liste = useRef(tendances);
  const [bulle, setBulle] = useState<Infobulle | null>(null);

  useEffect(() => {
    liste.current = tendances;
  }, [tendances]);

  useEffect(() => {
    const canvas = toile.current!;
    const box = boite.current!;
    const ctx = canvas.getContext('2d')!;
    const reduit = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    // La police du document (Figtree, chargée par next/font) pour les noms de villes
    const police = getComputedStyle(box).fontFamily;
    let lonC = 20;
    let latC = 28;
    let W = 0;
    let H = 0;
    let glisse: { x: number; y: number; lo: number; la: number } | null = null;
    let cible: { x: number; y: number } | null = null;
    let raf = 0;
    const t0 = performance.now();
    // Points survolables : [x, y, tendance], recalculés à chaque image
    let reperes: [number, number, TendanceResume][] = [];

    function taille() {
      const r = box.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      W = r.width;
      H = r.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    taille();
    const obs = new ResizeObserver(taille);
    obs.observe(box);

    function image(now: number) {
      if (!glisse && !reduit) lonC += 0.04;
      const R = Math.min(W, H) * 0.41;
      const cx = W / 2;
      const cy = H / 2 + 4;
      const p = (v: Vec3, k = 1) => projeter(v, lonC, latC, cx, cy, R, k);
      ctx.clearRect(0, 0, W, H);

      const at = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.14);
      at.addColorStop(0, 'rgba(120,180,235,.45)');
      at.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = at;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.14, 0, 6.283);
      ctx.fill();
      const g = ctx.createRadialGradient(
        cx - R * 0.4,
        cy - R * 0.45,
        R * 0.05,
        cx,
        cy,
        R,
      );
      g.addColorStop(0, '#D9EEFB');
      g.addColorStop(0.55, '#A9D2F0');
      g.addColorStop(1, '#78ADDB');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 6.283);
      ctx.fill();

      for (const v of TERRE) {
        const [x, y, d] = p(v);
        if (d <= 0) continue;
        const sh = 0.62 + 0.38 * d;
        ctx.fillStyle = `rgb(${(146 * sh) | 0},${(192 * sh) | 0},${(120 * sh) | 0})`;
        const s = 1.4 + 1.4 * d;
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }

      reperes = [];
      const avance = ((now - t0) / 6000) % 1;
      for (const t of liste.current) {
        const depart = VILLES[t.origine];
        if (!depart) continue;
        const A = vec(...depart);
        const col = couleurFamille(t.famille);
        const eteinte = t.statut === 'en_baisse';
        for (const nomPays of t.pays) {
          const arrivee = VILLES[nomPays];
          if (!arrivee) continue;
          const B = vec(...arrivee);
          ctx.beginPath();
          let trace = false;
          for (let s = 0; s <= 1.0001; s += 0.03) {
            const [x, y, d] = p(
              slerp(A, B, s),
              1 + 0.16 * Math.sin(Math.PI * s),
            );
            if (d < -0.05) {
              trace = false;
              continue;
            }
            if (trace) ctx.lineTo(x, y);
            else ctx.moveTo(x, y);
            trace = true;
            if (Math.round(s * 100) % 15 === 0) reperes.push([x, y, t]);
          }
          ctx.setLineDash(eteinte ? [3, 5] : []);
          ctx.strokeStyle = eteinte
            ? 'rgba(255,255,255,.8)'
            : `rgba(${col},.95)`;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.setLineDash([]);
          if (!eteinte && !reduit) {
            const [hx, hy, hd] = p(
              slerp(A, B, avance),
              1 + 0.16 * Math.sin(Math.PI * avance),
            );
            if (hd > -0.05) {
              ctx.beginPath();
              ctx.arc(hx, hy, 3.5, 0, 6.283);
              ctx.fillStyle = `rgb(${col})`;
              ctx.fill();
              ctx.strokeStyle = '#fff';
              ctx.lineWidth = 1.4;
              ctx.stroke();
            }
          }
        }
        const [ox, oy, od] = p(A);
        if (od > 0) {
          reperes.push([ox, oy, t]);
          ctx.beginPath();
          ctx.arc(ox, oy, 6, 0, 6.283);
          ctx.fillStyle = eteinte ? '#C9CCD6' : `rgb(${col})`;
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      ctx.font = `700 11.5px ${police}`;
      for (const [nom, ll] of Object.entries(VILLES)) {
        const [x, y, d] = p(vec(...ll));
        if (d <= 0.05) continue;
        ctx.globalAlpha = Math.min(1, 0.35 + d);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 6.283);
        ctx.fillStyle = '#171A21';
        ctx.fill();
        const tw = ctx.measureText(nom).width;
        ctx.fillStyle = 'rgba(255,255,255,.92)';
        ctx.fillRect(x + 7, y - 20, tw + 12, 17);
        ctx.fillStyle = '#2D313C';
        ctx.fillText(nom, x + 13, y - 7.5);
        ctx.globalAlpha = 1;
      }

      if (cible) {
        let proche: Infobulle | null = null;
        let best = 14 * 14;
        for (const [x, y, t] of reperes) {
          const dd = (x - cible.x) ** 2 + (y - cible.y) ** 2;
          if (dd < best) {
            best = dd;
            proche = { x, y, t };
          }
        }
        setBulle((avant) =>
          avant?.t.slug === proche?.t.slug ? avant : proche,
        );
      }
      raf = requestAnimationFrame(image);
    }
    raf = requestAnimationFrame(image);

    const pos = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const bas = (e: PointerEvent) => {
      glisse = { x: e.clientX, y: e.clientY, lo: lonC, la: latC };
      box.setPointerCapture(e.pointerId);
    };
    const bouge = (e: PointerEvent) => {
      cible = pos(e);
      if (!glisse) return;
      lonC = glisse.lo - (e.clientX - glisse.x) * 0.35;
      latC = Math.max(
        -60,
        Math.min(70, glisse.la + (e.clientY - glisse.y) * 0.3),
      );
    };
    const haut = () => {
      glisse = null;
    };
    const sort = () => {
      cible = null;
      setBulle(null);
    };
    box.addEventListener('pointerdown', bas);
    box.addEventListener('pointermove', bouge);
    box.addEventListener('pointerup', haut);
    box.addEventListener('pointercancel', haut);
    box.addEventListener('pointerleave', sort);
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
      box.removeEventListener('pointerdown', bas);
      box.removeEventListener('pointermove', bouge);
      box.removeEventListener('pointerup', haut);
      box.removeEventListener('pointercancel', haut);
      box.removeEventListener('pointerleave', sort);
    };
  }, []);

  return (
    <div
      ref={boite}
      className="box globebox"
      data-testid="globe"
      style={{ height: 560 }}
    >
      <canvas
        ref={toile}
        role="img"
        aria-label="Globe des tendances : faites-le tourner à la souris ou au doigt. La liste donne accès aux mêmes tendances au clavier."
      />
      <LegendeGlobe />
      {bulle && (
        <div
          className="bub"
          role="tooltip"
          style={{ left: bulle.x, top: bulle.y - 34, pointerEvents: 'none' }}
        >
          <b>{bulle.t.nom}</b> · {statutTendance(bulle.t.statut).libelle}
          <br />
          <span style={{ fontWeight: 500 }}>
            {bulle.t.origine} → {bulle.t.pays.join(', ')}
          </span>
        </div>
      )}
    </div>
  );
}
