import {
  couleurFamille,
  ETEINT,
  LEGENDE_FAMILLES,
  LEGENDE_STATUTS,
} from '@/lib/famille';

// US-12 : sur le globe, chaque couleur nommée ; la couleur n'est jamais la seule information
export function LegendeGlobe() {
  return (
    <div className="legend" aria-label="Légende du globe">
      {LEGENDE_FAMILLES.map((f) => (
        <span key={f}>
          <i
            className="dot"
            style={{ background: `rgb(${couleurFamille(f)})` }}
          />
          {f}
        </span>
      ))}
      <span>
        <i className="dot" style={{ background: `rgb(${ETEINT})` }} />
        En baisse (trait en pointillés)
      </span>
    </div>
  );
}

// US-12 : la pastille de statut, toujours écrite en texte
export function LegendeStatuts() {
  return (
    <p className="cl" aria-label="Légende des statuts" style={{ margin: 0 }}>
      <span className="note">Statuts :</span>
      {LEGENDE_STATUTS.map((s) => (
        <span key={s.libelle} className={`chip ${s.chip}`}>
          {s.libelle}
        </span>
      ))}
    </p>
  );
}
