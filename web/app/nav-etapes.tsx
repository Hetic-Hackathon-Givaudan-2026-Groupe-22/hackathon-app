'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Les étapes du parcours, comme dans le prototype ; l'étape courante est en noir
export function NavEtapes() {
  const chemin = usePathname();
  const enAnalyse = chemin.startsWith('/analyses');
  return (
    <nav className="steps" aria-label="Étapes">
      <Link
        href="/tendances"
        className="step"
        aria-current={chemin.startsWith('/tendances') ? 'page' : undefined}
      >
        1 · Tendances
      </Link>
      <span className="step" aria-current={enAnalyse ? 'page' : undefined}>
        2 · Analyse et verdict
      </span>
      <Link
        href="/historique"
        className="step"
        aria-current={chemin.startsWith('/historique') ? 'page' : undefined}
      >
        3 · Historique
      </Link>
    </nav>
  );
}
