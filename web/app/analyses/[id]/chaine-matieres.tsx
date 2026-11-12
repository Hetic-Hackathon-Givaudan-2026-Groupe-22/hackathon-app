import type { Analyse } from '@/lib/analyse';
import { etapesChaine } from '@/lib/chaine';

// US-20 : la chaîne tendance → notes olfactives → matières → prix, chaque maillon sourcé
export function ChaineMatieres({ analyse }: { analyse: Analyse }) {
  const etapes = etapesChaine(analyse);
  return (
    <ol
      className="grid gap-3 md:grid-cols-4"
      aria-label="Chaîne tendance, notes, matières, prix"
    >
      {etapes.map((etape, i) => (
        <li key={etape.titre} className="flex flex-col gap-2">
          <p className="flex items-center gap-2 font-semibold">
            <span className="badge badge-primary">{i + 1}</span>
            {etape.titre}
            {i < etapes.length - 1 && (
              <span aria-hidden className="ml-auto hidden opacity-50 md:inline">
                →
              </span>
            )}
          </p>
          {etape.maillons.map((m) => (
            <div
              key={m.nom}
              className="rounded-box bg-base-100 p-3 text-sm shadow-sm"
            >
              <p className="font-semibold">{m.nom}</p>
              <p>{m.detail}</p>
              <p className="mt-1 text-xs opacity-70">Source : {m.source}</p>
            </div>
          ))}
        </li>
      ))}
    </ol>
  );
}
