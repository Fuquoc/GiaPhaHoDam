'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import familyData from '@/data/family.json';
import SearchBox from '@/components/SearchBox';
import PersonCard from '@/components/PersonCard';
import Link from 'next/link';
import type { FamilyData } from '@/lib/data/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q')?.trim() ?? '';
  const data = familyData as FamilyData;
  const query = q.toLowerCase();
  const results = query
    ? data.members.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.aliases.some((a) => a.toLowerCase().includes(query)) ||
          p.notes.toLowerCase().includes(query)
      )
    : [];

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
            <p>Không tìm thấy thành viên nào với tên &ldquo;{q}&rdquo;</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gray-50" />}>
      <SearchContent />
    </Suspense>
  );
}
