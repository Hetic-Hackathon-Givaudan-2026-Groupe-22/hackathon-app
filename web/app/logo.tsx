// La comète de Sillage : quatre grains aux couleurs des familles d'arômes
export function Comete({ taille = 24, anime = false }) {
  return (
    <svg
      className={anime ? 'comet' : undefined}
      width={taille}
      height={taille}
      viewBox="0 0 34 34"
      aria-hidden="true"
    >
      <circle cx="6" cy="26" r="2.6" fill="#A9B8F5" />
      <circle cx="11" cy="21" r="3.4" fill="#8ED6B8" />
      <circle cx="17" cy="15" r="4.4" fill="#F4A6B7" />
      <circle cx="25" cy="9" r="6" fill="#F6C35E" />
    </svg>
  );
}
