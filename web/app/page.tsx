import Link from 'next/link';
import { ApiStatus } from './api-status';
import { Comete } from './logo';

// Ouverture, reprise du prototype (sans connexion : US-03 est en P2)
export default function Accueil() {
  return (
    <section className="intro-page" aria-label="Ouverture">
      <div className="intro-in">
        <div className="brand" aria-label="Sillage">
          <Comete taille={64} anime />
          <span>sillage</span>
        </div>
        <h1>Avant qu&apos;une tendance arrive, elle laisse un sillage.</h1>
        <p>
          Sillage repère les tendances, suit leur trace jusqu&apos;au prix des
          matières et aide Givaudan à décider avant les autres.
        </p>
        <Link href="/tendances" className="btn">
          Voir les tendances <span aria-hidden="true">›</span>
        </Link>
        <p className="note">
          Démonstration : les analyses sont simulées par l&apos;API, le service
          Data n&apos;est pas encore branché.
        </p>
        <ApiStatus />
      </div>
    </section>
  );
}
