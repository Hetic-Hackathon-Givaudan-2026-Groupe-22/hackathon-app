import { ApiStatus } from './api-status';

export default function Home() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-16 font-sans">
      <h1 className="text-3xl font-semibold">Sillage</h1>
      <ApiStatus />
    </main>
  );
}
