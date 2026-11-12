'use client';

// Bouton « Lancer l'analyse » de la fiche (US-13) ; le lancement arrive avec US-14
export function BoutonLancerAnalyse({ slug }: { slug: string }) {
  return (
    <div>
      <button className="btn btn-primary" data-slug={slug} disabled>
        Lancer l&apos;analyse
      </button>
    </div>
  );
}
