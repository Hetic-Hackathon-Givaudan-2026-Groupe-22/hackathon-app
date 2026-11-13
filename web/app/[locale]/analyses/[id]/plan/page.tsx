import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import { PlanAction } from './plan-action';

export const metadata = { title: "Plan d'action · Sillage" };

async function Plan({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlanAction id={id} />;
}

export default function PagePlan({
  params,
}: PageProps<'/[locale]/analyses/[id]/plan'>) {
  const t = useTranslations();
  return (
    <section className="view narrow" style={{ maxWidth: 1260 }}>
      <Suspense fallback={<p className="note">{t('chargement')}</p>}>
        <Plan params={params} />
      </Suspense>
    </section>
  );
}
