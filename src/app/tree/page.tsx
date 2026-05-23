import { getDataSource } from '@/lib/data';
import { buildTree, personsToMap } from '@/lib/buildTree';
import FamilyTreeView from '@/components/FamilyTreeView';
import SearchBox from '@/components/SearchBox';
import Link from 'next/link';

export default async function TreePage() {
  const ds = getDataSource();
  const all = await ds.getAll();
  const personMap = personsToMap(all);

  // Root: Đàm Phú Lạc
  const treeData = buildTree('p001', personMap);

  if (!treeData) {
    return <div className="p-8 text-gray-500">Không tìm thấy dữ liệu gốc.</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-3 z-10 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-gray-900">Gia Phả Họ Đàm</h1>
          <span className="text-gray-300">|</span>
          <div className="flex text-sm rounded-lg overflow-hidden border border-gray-200">
            <Link
              href="/"
              className="px-3 py-1.5 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Theo đời
            </Link>
            <span className="px-3 py-1.5 bg-blue-600 text-white font-medium">
              Cây gia phả
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-400 hidden sm:block">Kéo để di chuyển · Cuộn để zoom</p>
          <SearchBox />
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <FamilyTreeView treeData={treeData} />
      </div>
    </div>
  );
}
