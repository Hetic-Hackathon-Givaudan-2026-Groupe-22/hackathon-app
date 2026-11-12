import { Suspense } from 'react';
import { SuiviAnalyse } from './suivi-analyse';

export const metadata = { title: 'Analyse · Sillage' };

async function Suivi({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SuiviAnalyse id={id} />;
}

export default function PageAnalyse({ params }: PageProps<'/analyses/[id]'>) {
  return (
    <Suspense fallback={<p className="note view">Chargement…</p>}>
      <Suivi params={params} />
    </Suspense>
  );
}
