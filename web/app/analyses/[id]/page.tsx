import { Suspense } from 'react';
import { SuiviAnalyse } from './suivi-analyse';

export const metadata = { title: 'Analyse · Sillage' };

async function Suivi({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SuiviAnalyse id={id} />;
}

export default function PageAnalyse({ params }: PageProps<'/analyses/[id]'>) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <Suspense fallback={<span className="loading loading-dots" />}>
        <Suivi params={params} />
      </Suspense>
    </main>
  );
}
