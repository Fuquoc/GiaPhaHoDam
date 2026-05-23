import { getDataSource } from '@/lib/data';
import SearchBox from '@/components/SearchBox';
import PersonCard from '@/components/PersonCard';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams;
  const ds = getDataSource();
  const results = await ds.search(q);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600">
            Gia Phả Họ Đàm
          </Link>
          <SearchBox defaultValue={q} />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500 mb-4">
          {q ? (
            <>Kết quả tìm kiếm cho <strong>&ldquo;{q}&rdquo;</strong>: {results.length} người</>
          ) : (
            'Nhập tên để tìm kiếm'
          )}
        </p>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {results.map((p) => (
              <PersonCard key={p.id} person={p} />
            ))}
          </div>
        ) : q ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">🔍</p>
            <p>Không tìm thấy thành viên nào với tên &ldquo;{q}&rdquo;</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
