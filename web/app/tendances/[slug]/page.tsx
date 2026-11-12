import { Suspense } from 'react';
import { FicheTendance } from './fiche-tendance';

export const metadata = { title: 'Fiche · Sillage' };

// params est lu à la requête : dans un <Suspense>, le reste de la page est prérendu
async function Fiche({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <FicheTendance slug={slug} />;
}

export default function PageFiche({ params }: PageProps<'/tendances/[slug]'>) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <Suspense fallback={<span className="loading loading-dots" />}>
        <Fiche params={params} />
      </Suspense>
    </main>
  );
}
