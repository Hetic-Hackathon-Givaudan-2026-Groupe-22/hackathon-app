import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import { FicheTendance } from './fiche-tendance';

export const metadata = { title: 'Fiche · Sillage' };

async function Fiche({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <FicheTendance slug={slug} />;
}

export default function PageFiche({
  params,
}: PageProps<'/[locale]/tendances/[slug]'>) {
  const t = useTranslations();
  return (
    <section className="view narrow">
      <Suspense fallback={<p className="note">{t('chargement')}</p>}>
        <Fiche params={params} />
      </Suspense>
    </section>
  );
}
