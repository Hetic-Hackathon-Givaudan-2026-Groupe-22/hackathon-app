import Link from 'next/link';
import { ApiStatus } from './api-status';

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <h1 className="text-3xl font-semibold">Sillage</h1>
      <p>
        Distinguer un buzz passager d&apos;une tendance durable, preuves à
        l&apos;appui.
      </p>
      <div>
        <Link href="/tendances" className="btn btn-primary">
          Explorer les tendances
        </Link>
      </div>
      <div className="alert alert-warning text-sm">
        Démonstration : les analyses sont simulées par l&apos;API, le service
        Data n&apos;est pas encore branché.
      </div>
      <ApiStatus />
    </main>
  );
}
