import { Suspense } from 'react';
import { SuiviAnalyse } from './suivi-analyse';

export const metadata = { title: 'Analyse · Sillage' };

async function Suivi({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ vue?: string | string[] }>;
}) {
  const { id } = await params;
  const { vue } = await searchParams;
  // ?vue=verdict : ouvre directement le verdict (verdict passé rouvert, US-32)
  return <SuiviAnalyse id={id} vue={vue === 'verdict' ? 'verdict' : 'tour'} />;
}

export default function PageAnalyse({
  params,
  searchParams,
}: PageProps<'/analyses/[id]'>) {
  return (
    <Suspense fallback={<p className="note view">Chargement…</p>}>
      <Suivi params={params} searchParams={searchParams} />
    </Suspense>
  );
}
