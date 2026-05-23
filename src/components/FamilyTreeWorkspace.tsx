'use client';

import dynamic from 'next/dynamic';
import { useCallback, useMemo, useState } from 'react';
import type { RawNodeDatum, CustomNodeElementProps } from 'react-d3-tree';
import { buildTree, personsToMap } from '@/lib/buildTree';
import type { Gender, Person } from '@/lib/data/types';

const Tree = dynamic(() => import('react-d3-tree').then((m) => m.Tree), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-slate-500">
      Đang tải cây gia phả...
    </div>
  ),
});

interface Props {
  initialMembers: Person[];
}

type EditableField = keyof Pick<
  Person,
  'name' | 'gender' | 'born' | 'died' | 'birthPlace' | 'deathPlace' | 'generation' | 'branch' | 'notes'
>;

type NodeAttrs = {
  id: string;
  spouse: string;
  years: string;
  gender: string;
  generation: number | string;
};

const emptyPerson = (id: string, name: string, generation: number | null): Person => ({
  id,
  name,
  gender: 'unknown',
  born: null,
  died: null,
  birthPlace: '',
  deathPlace: '',
  fatherId: null,
  motherId: null,
  spouseIds: [],
  childrenIds: [],
  generation,
  branch: '',
  photo: '',
  aliases: [],
  notes: '',
});

function nextId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function parseNullableNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function PersonNode({
  nodeDatum,
  onClick,
  selectedId,
}: CustomNodeElementProps & { onClick: (id: string) => void; selectedId: string | null }) {
  const datum = nodeDatum as unknown as { name: string; attributes: NodeAttrs };
  const attrs = datum.attributes;
  const isSelected = attrs.id === selectedId;
  const isMale = attrs.gender === 'male';
  const isFemale = attrs.gender === 'female';

  const fill = isMale ? '#eff6ff' : isFemale ? '#fdf2f8' : '#f8fafc';
  const stroke = isSelected ? '#0f172a' : isMale ? '#2563eb' : isFemale ? '#db2777' : '#94a3b8';
  const spouse = attrs.spouse ? String(attrs.spouse) : '';
  const name = datum.name.length > 24 ? `${datum.name.slice(0, 23)}…` : datum.name;
  const spouseText = spouse.length > 25 ? `${spouse.slice(0, 24)}…` : spouse;
  const width = 168;
  const height = spouse || attrs.years ? 74 : 48;

  return (
    <g onClick={() => onClick(attrs.id)} style={{ cursor: 'pointer' }}>
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx={8}
        fill={fill}
        stroke={stroke}
        strokeWidth={isSelected ? 2.5 : 1.5}
      />
      <foreignObject
        x={-width / 2 + 8}
        y={-height / 2 + 6}
        width={width - 16}
        height={height - 12}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            color: '#0f172a',
            fontFamily: 'Tahoma, Arial, sans-serif',
            textAlign: 'center',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
          }}
        >
          <div
            style={{
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: 11,
              fontWeight: 600,
              lineHeight: '14px',
            }}
          >
            {name}
          </div>
          {spouse && (
            <div
              style={{
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#64748b',
                fontSize: 9,
                fontWeight: 400,
                lineHeight: '12px',
              }}
            >
              + {spouseText}
            </div>
          )}
          {attrs.generation && (
            <div
              style={{
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#64748b',
                fontSize: 9,
                fontWeight: 400,
                lineHeight: '12px',
              }}
            >
              Đời {attrs.generation}{attrs.years ? ` · ${attrs.years}` : ''}
            </div>
          )}
        </div>
      </foreignObject>
    </g>
  );
}

export default function FamilyTreeWorkspace({ initialMembers }: Props) {
  const [members, setMembers] = useState<Person[]>(initialMembers);
  const [rootId, setRootId] = useState('root');
  const [selectedId, setSelectedId] = useState('root');
  const [query, setQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [translate, setTranslate] = useState({ x: 420, y: 80 });
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  const personMap = useMemo(() => personsToMap(members), [members]);
  const selected = selectedId ? personMap.get(selectedId) ?? null : null;
  const treeData = useMemo(() => buildTree(rootId, personMap), [rootId, personMap]);

  const rootOptions = useMemo(
    () =>
      members
        .filter((p) => p.id === 'root' || p.generation === 1 || p.name.includes('Đàm Phú Lạc'))
        .sort((a, b) => (a.generation ?? 0) - (b.generation ?? 0)),
    [members]
  );

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return members
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.aliases.some((a) => a.toLowerCase().includes(q)) ||
          p.notes.toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [members, query]);

  const onContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && !containerRef) {
        setTranslate({ x: node.clientWidth / 2, y: 80 });
      }
      setContainerRef(node);
    },
    [containerRef]
  );

  const updatePerson = useCallback((id: string, patch: Partial<Person>) => {
    setMembers((current) => current.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const updateField = useCallback(
    (field: EditableField, value: string) => {
      if (!selected) return;
      const numericFields = new Set<EditableField>(['born', 'died', 'generation']);
      updatePerson(selected.id, {
        [field]: numericFields.has(field) ? parseNullableNumber(value) : value,
      } as Partial<Person>);
    },
    [selected, updatePerson]
  );

  const addChild = useCallback(() => {
    if (!selected) return;
    const id = nextId('person');
    const child = emptyPerson(id, 'Người mới', selected.generation ? selected.generation + 1 : null);
    child.branch = selected.branch;
    if (selected.gender === 'female') {
      child.motherId = selected.id;
    } else {
      child.fatherId = selected.id;
    }

    setMembers((current) => [
      ...current.map((p) =>
        p.id === selected.id ? { ...p, childrenIds: [...new Set([...p.childrenIds, id])] } : p
      ),
      child,
    ]);
    setSelectedId(id);
  }, [selected]);

  const addSpouse = useCallback(() => {
    if (!selected) return;
    const id = nextId('spouse');
    const spouse = emptyPerson(id, 'Vợ/chồng mới', selected.generation);
    spouse.branch = selected.branch;
    spouse.gender = selected.gender === 'male' ? 'female' : selected.gender === 'female' ? 'male' : 'unknown';
    spouse.spouseIds = [selected.id];

    setMembers((current) => [
      ...current.map((p) =>
        p.id === selected.id ? { ...p, spouseIds: [...new Set([...p.spouseIds, id])] } : p
      ),
      spouse,
    ]);
    setSelectedId(id);
  }, [selected]);

  const downloadJson = useCallback(() => {
    const payload = JSON.stringify({ members }, null, 2);
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'family.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [members]);

  const resetData = useCallback(() => {
    setMembers(initialMembers);
    setRootId('root');
    setSelectedId('root');
    setQuery('');
  }, [initialMembers]);

  const renderNode = useCallback(
    (props: CustomNodeElementProps) => (
      <PersonNode {...props} selectedId={selectedId} onClick={(id) => setSelectedId(id)} />
    ),
    [selectedId]
  );

  const controlsContent = (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      <select
        value={rootId}
        onChange={(event) => {
          setRootId(event.target.value);
          setSelectedId(event.target.value);
        }}
        className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
      >
        {rootOptions.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <div className="flex rounded-md border border-slate-300 bg-white p-0.5">
        <button
          type="button"
          onClick={() => setIsEditMode(false)}
          className={`h-8 flex-1 rounded px-3 text-sm font-medium ${
            !isEditMode ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Xem
        </button>
        <button
          type="button"
          onClick={() => setIsEditMode(true)}
          className={`h-8 flex-1 rounded px-3 text-sm font-medium ${
            isEditMode ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Chỉnh sửa
        </button>
      </div>
      {isEditMode && (
        <button
          type="button"
          onClick={downloadJson}
          className="h-9 rounded-md bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-700"
        >
          Tải JSON
        </button>
      )}
      {isEditMode && (
        <button
          type="button"
          onClick={resetData}
          className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Hoàn tác tạm
        </button>
      )}
    </div>
  );

  const selectedPanel = selected ? (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {isEditMode ? 'Đang chỉnh sửa' : 'Đang xem'}
        </p>
        <h2 className="mt-1 text-xl font-bold">{selected.name}</h2>
        <p className="text-sm text-slate-500">ID: {selected.id}</p>
      </div>

      {isEditMode && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={addChild}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Thêm con
          </button>
          <button
            type="button"
            onClick={addSpouse}
            className="rounded-md bg-pink-600 px-3 py-2 text-sm font-medium text-white hover:bg-pink-500"
          >
            Thêm vợ/chồng
          </button>
        </div>
      )}

      {isEditMode ? (
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            Họ tên
            <input
              value={selected.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 text-sm"
            />
          </label>

          <label className="block text-sm font-medium">
            Giới tính
            <select
              value={selected.gender}
              onChange={(event) => updateField('gender', event.target.value as Gender)}
              className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="unknown">Chưa rõ</option>
            </select>
          </label>

          <div className="grid grid-cols-3 gap-2">
            <label className="block text-sm font-medium">
              Đời
              <input
                value={selected.generation ?? ''}
                onChange={(event) => updateField('generation', event.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 text-sm"
              />
            </label>
            <label className="block text-sm font-medium">
              Sinh
              <input
                value={selected.born ?? ''}
                onChange={(event) => updateField('born', event.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 text-sm"
              />
            </label>
            <label className="block text-sm font-medium">
              Mất
              <input
                value={selected.died ?? ''}
                onChange={(event) => updateField('died', event.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 text-sm"
              />
            </label>
          </div>

          <label className="block text-sm font-medium">
            Nhánh
            <input
              value={selected.branch}
              onChange={(event) => updateField('branch', event.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 text-sm"
            />
          </label>

          <label className="block text-sm font-medium">
            Nơi sinh
            <input
              value={selected.birthPlace}
              onChange={(event) => updateField('birthPlace', event.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 text-sm"
            />
          </label>

          <label className="block text-sm font-medium">
            Nơi mất
            <input
              value={selected.deathPlace}
              onChange={(event) => updateField('deathPlace', event.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 text-sm"
            />
          </label>

          <label className="block text-sm font-medium">
            Ghi chú
            <textarea
              value={selected.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              rows={5}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
          <div className="grid grid-cols-[88px_1fr] gap-2">
            <span className="text-slate-500">Giới tính</span>
            <span>{selected.gender === 'male' ? 'Nam' : selected.gender === 'female' ? 'Nữ' : 'Chưa rõ'}</span>
          </div>
          <div className="grid grid-cols-[88px_1fr] gap-2">
            <span className="text-slate-500">Đời</span>
            <span>{selected.generation ?? 'Chưa rõ'}</span>
          </div>
          <div className="grid grid-cols-[88px_1fr] gap-2">
            <span className="text-slate-500">Sinh/mất</span>
            <span>
              {selected.born ?? '?'}{selected.died ? ` - ${selected.died}` : ''}
            </span>
          </div>
          <div className="grid grid-cols-[88px_1fr] gap-2">
            <span className="text-slate-500">Nhánh</span>
            <span>{selected.branch || 'Chưa rõ'}</span>
          </div>
          {selected.birthPlace && (
            <div className="grid grid-cols-[88px_1fr] gap-2">
              <span className="text-slate-500">Nơi sinh</span>
              <span>{selected.birthPlace}</span>
            </div>
          )}
          {selected.deathPlace && (
            <div className="grid grid-cols-[88px_1fr] gap-2">
              <span className="text-slate-500">Nơi mất</span>
              <span>{selected.deathPlace}</span>
            </div>
          )}
          {selected.notes && (
            <div>
              <p className="mb-1 text-slate-500">Ghi chú</p>
              <p className="leading-relaxed text-slate-800">{selected.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  ) : (
    <div className="text-sm text-slate-500">Chọn một người trên cây để xem và sửa.</div>
  );

  return (
    <div className="flex h-screen flex-col bg-slate-100 text-slate-950">
      <header className="shrink-0 border-b border-slate-200 bg-white px-3 py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div>
              <h1 className="text-lg font-bold leading-tight">Gia phả họ Đàm</h1>
              <p className="text-xs text-slate-500">{members.length} người · chỉnh sửa trong trình duyệt</p>
            </div>
          </div>

          <div className="hidden lg:block">{controlsContent}</div>
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="h-9 rounded-md bg-slate-900 px-3 text-sm font-medium text-white shadow-sm"
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-slate-950/45"
          />
          <div className="absolute right-0 top-0 flex h-full w-[min(92vw,380px)] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Menu</p>
                <p className="text-xs text-slate-500">{isEditMode ? 'Chế độ chỉnh sửa' : 'Chế độ xem'}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="h-9 rounded-md border border-slate-300 px-3 text-sm font-medium"
              >
                Đóng
              </button>
            </div>
            <div className="border-b border-slate-200 p-4">{controlsContent}</div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">{selectedPanel}</div>
          </div>
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_360px]">
        <section className="relative min-h-[56vh] overflow-hidden bg-slate-50 lg:min-h-0">
          <div className="absolute left-3 top-3 z-10 w-[calc(100%-1.5rem)] max-w-md rounded-lg border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm tên, tên khác, ghi chú..."
              className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
            />
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-56 overflow-auto rounded-md border border-slate-200 bg-white">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(p.id);
                      setQuery('');
                    }}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="ml-2 text-xs text-slate-500">Đời {p.generation ?? '?'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div ref={onContainerRef} className="h-full min-h-[56vh] w-full lg:min-h-0">
            {treeData ? (
              <Tree
                data={treeData as unknown as RawNodeDatum}
                orientation="vertical"
                translate={translate}
                nodeSize={{ x: 190, y: 125 }}
                separation={{ siblings: 1.15, nonSiblings: 1.55 }}
                renderCustomNodeElement={renderNode}
                pathFunc="step"
                zoom={0.8}
                scaleExtent={{ min: 0.12, max: 2 }}
                enableLegacyTransitions={false}
                pathClassFunc={() => 'stroke-slate-300 fill-none stroke-[1.5]'}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Không dựng được cây từ gốc đã chọn.
              </div>
            )}
          </div>
        </section>

        <aside className="hidden min-h-0 overflow-y-auto border-l border-slate-200 bg-white p-4 lg:block">
          {selectedPanel}
        </aside>
      </div>
    </div>
  );
}
