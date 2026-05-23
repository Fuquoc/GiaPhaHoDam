import { notFound } from 'next/navigation';
import { getDataSource } from '@/lib/data';
import PersonCard from '@/components/PersonCard';
import Link from 'next/link';

interface Props {
  params: Promise<{ name: string }>;
}

export default async function BranchPage({ params }: Props) {
  const { name } = await params;
  const branchName = decodeURIComponent(name);
  const ds = getDataSource();
  const members = await ds.getByBranch(branchName);

  if (members.length === 0) notFound();

  const byGen = new Map<number, typeof members>();
  for (const p of members) {
    const gen = p.generation ?? 0;
    const arr = byGen.get(gen) ?? [];
    arr.push(p);
    byGen.set(gen, arr);
  }
  const generations = [...byGen.keys()].sort((a, b) => a - b);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600">
            Gia Phả Họ Đàm
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-700">{branchName}</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500 mb-6">{members.length} thành viên trong nhánh này</p>

        {generations.map((gen) => {
          const genMembers = byGen.get(gen) ?? [];
          if (genMembers.length === 0) return null;
          return (
            <div key={gen} className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 mb-3">
                {gen === 0 ? 'Chưa xác định đời' : `Đời thứ ${gen}`}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {genMembers.map((p) => <PersonCard key={p.id} person={p} />)}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

export async function generateStaticParams() {
  const ds = getDataSource();
  const all = await ds.getAll();
  const branches = [...new Set(all.map((p) => p.branch).filter(Boolean))];

  return branches.map((name) => ({ name: encodeURIComponent(name) }));
}
