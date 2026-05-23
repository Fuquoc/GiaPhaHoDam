import { getDataSource } from '@/lib/data';
import SearchBox from '@/components/SearchBox';
import GenerationRow from '@/components/GenerationRow';

export default async function HomePage() {
  const ds = getDataSource();
  const all = await ds.getAll();

  const byGen = new Map<number, typeof all>();
  const noGen: typeof all = [];

  for (const p of all) {
    if (p.generation == null) {
      noGen.push(p);
    } else {
      const arr = byGen.get(p.generation) ?? [];
      arr.push(p);
      byGen.set(p.generation, arr);
    }
  }

  const generations = [...byGen.keys()].sort((a, b) => a - b);
  const branches = [...new Set(all.map((p) => p.branch).filter(Boolean))].sort();

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Gia Phả Họ Đàm</h1>
            <span className="text-gray-300">|</span>
            <div className="flex text-sm rounded-lg overflow-hidden border border-gray-200">
              <span className="px-3 py-1.5 bg-blue-600 text-white font-medium">Theo đời</span>
              <a href="/tree" className="px-3 py-1.5 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
                Cây gia phả
              </a>
            </div>
            <p className="text-xs text-gray-400 hidden sm:block">{all.length} thành viên</p>
          </div>
          <SearchBox />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-xs font-medium text-gray-500 self-center">Lọc theo nhánh:</span>
          {branches.map((b) => (
            <a
              key={b}
              href={`/branch/${encodeURIComponent(b)}`}
              className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              {b}
            </a>
          ))}
        </div>

        {generations.map((gen) => (
          <GenerationRow
            key={gen}
            generation={gen}
            members={byGen.get(gen) ?? []}
          />
        ))}

        {noGen.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm text-gray-400 mb-2">Chưa xác định đời</h3>
            <div className="flex flex-wrap gap-2">
              {noGen.map((p) => (
                <a
                  key={p.id}
                  href={`/person/${p.id}`}
                  className="text-xs border rounded px-2 py-1 text-gray-600 hover:bg-gray-100"
                >
                  {p.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
