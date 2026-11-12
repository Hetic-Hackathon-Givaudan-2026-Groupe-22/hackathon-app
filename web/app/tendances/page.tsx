import { ListeTendances } from './liste-tendances';

export const metadata = { title: 'Tendances · Sillage' };

export default function PageTendances() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold">Tendances</h1>
      <ListeTendances />
    </main>
  );
}
