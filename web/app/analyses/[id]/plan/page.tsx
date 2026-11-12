import { Suspense } from 'react';
import { PlanAction } from './plan-action';

export const metadata = { title: "Plan d'action · Sillage" };

async function Plan({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlanAction id={id} />;
}

export default function PagePlan({ params }: PageProps<'/analyses/[id]/plan'>) {
  return (
    <section className="view narrow" style={{ maxWidth: 1260 }}>
      <Suspense fallback={<p className="note">Chargement…</p>}>
        <Plan params={params} />
      </Suspense>
    </section>
  );
}
