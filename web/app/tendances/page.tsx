import { ListeTendances } from './liste-tendances';

export const metadata = { title: 'Tendances · Sillage' };

export default function PageTendances() {
  return (
    <section className="view">
      <div className="head">
        <div>
          <div className="eyebrow">
            Veille en continu · données de démonstration
          </div>
          <h2 className="t">Les tendances du moment</h2>
          <p className="lede">
            Chaque tendance porte la couleur de sa famille d&apos;arômes. Celles
            que vous suivez sont en tête. Cherchez une tendance, puis
            analysez-la.
          </p>
        </div>
      </div>
      <ListeTendances />
    </section>
  );
}
