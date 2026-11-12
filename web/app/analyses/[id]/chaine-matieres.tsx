import type { Analyse } from '@/lib/analyse';
import { etapesChaine } from '@/lib/chaine';

// US-20 : la chaîne tendance → notes olfactives → matières → prix, chaque maillon sourcé
export function ChaineMatieres({ analyse }: { analyse: Analyse }) {
  const etapes = etapesChaine(analyse);
  return (
    <div style={{ marginTop: 18 }}>
      <p className="lede" style={{ marginTop: 0 }}>
        Lisez de gauche à droite : la tendance se relie à ses notes, puis aux
        matières premières qui les fabriquent, puis à leur prix.
      </p>
      <div className="prog" aria-hidden="true">
        {etapes.map((e) => (
          <span key={e.titre} className="on">
            {e.titre}
          </span>
        ))}
      </div>
      <ol
        className="chain"
        aria-label="Chaîne tendance, notes, matières, prix"
        style={{ listStyle: 'none', padding: 0 }}
      >
        {etapes.map((etape, i) => (
          <li key={etape.titre} className="col">
            <span className="col-h">
              <span className="num">{i + 1}</span>
              {etape.titre}
            </span>
            {etape.maillons.map((m) =>
              etape.titre === 'Prix' ? (
                <div key={m.nom} className="price">
                  <span className="note" style={{ color: 'inherit' }}>
                    {m.nom}
                  </span>
                  <b>{m.detail}</b>
                  <span style={{ fontSize: 12.5 }}>Source : {m.source}</span>
                </div>
              ) : (
                <div key={m.nom} className="tc">
                  <b>{m.nom}</b>
                  <span>{m.detail}</span>
                  <span className="note">Source : {m.source}</span>
                </div>
              ),
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
