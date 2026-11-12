import { Suspense } from 'react';
import { FicheTendance } from './fiche-tendance';

export const metadata = { title: 'Fiche · Sillage' };

async function Fiche({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <FicheTendance slug={slug} />;
}

export default function PageFiche({ params }: PageProps<'/tendances/[slug]'>) {
  return (
    <section className="view narrow">
      <Suspense fallback={<p className="note">Chargement…</p>}>
        <Fiche params={params} />
      </Suspense>
    </section>
  );
}
