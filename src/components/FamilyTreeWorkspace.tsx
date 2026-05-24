'use client';

import dynamic from 'next/dynamic';
import { useCallback, useMemo, useState } from 'react';
import type { RawNodeDatum, CustomNodeElementProps } from 'react-d3-tree';
import { buildTree, personsToMap } from '@/lib/buildTree';
import type { Gender, Person } from '@/lib/data/types';
import {
  Search, Download, RotateCcw, Plus, Heart, Eye, Pencil,
  X, Menu, Calendar, MapPin, GitBranch, Hash, FileText,
  User, ChevronDown, TreePine,
} from 'lucide-react';

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

function personName(person: Partial<Person>) {
  return typeof person.name === 'string' && person.name.trim() ? person.name : 'Chưa rõ tên';
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

  const spouse = attrs.spouse ? String(attrs.spouse) : '';
  const name = datum.name.length > 22 ? `${datum.name.slice(0, 21)}…` : datum.name;
  const spouseText = spouse.length > 23 ? `${spouse.slice(0, 22)}…` : spouse;
  const width = 172;
  const height = spouse || attrs.years ? 76 : 46;

  const bgColor = isMale ? '#eff6ff' : isFemale ? '#fdf2f8' : '#f8fafc';
  const accentColor = isMale ? '#2563eb' : isFemale ? '#db2777' : '#64748b';
  const borderColor = isSelected ? '#0f172a' : isMale ? '#93c5fd' : isFemale ? '#f9a8d4' : '#cbd5e1';
  const genderSymbol = isMale ? '♂' : isFemale ? '♀' : '·';
  const symbolColor = isMale ? '#3b82f6' : isFemale ? '#ec4899' : '#94a3b8';

  return (
    <g onClick={() => onClick(attrs.id)} style={{ cursor: 'pointer' }}>
      {/* Shadow */}
      <rect
        x={-width / 2 + 2}
        y={-height / 2 + 3}
        width={width}
        height={height}
        rx={10}
        fill="rgba(0,0,0,0.08)"
      />
      {/* Card */}
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx={10}
        fill={bgColor}
        stroke={borderColor}
        strokeWidth={isSelected ? 2.5 : 1.5}
      />
      {/* Left accent bar */}
      <rect
        x={-width / 2}
        y={-height / 2 + 4}
        width={4}
        height={height - 8}
        rx={2}
        fill={accentColor}
      />
      {/* Gender symbol */}
      <text
        x={width / 2 - 10}
        y={-height / 2 + 14}
        fontSize={12}
        fill={symbolColor}
        fontFamily="system-ui, sans-serif"
        textRendering="geometricPrecision"
        textAnchor="middle"
      >
        {genderSymbol}
      </text>

      <foreignObject
        x={-width / 2 + 12}
        y={-height / 2 + 5}
        width={width - 28}
        height={height - 10}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 2,
            fontFamily: 'Segoe UI, system-ui, sans-serif',
            WebkitFontSmoothing: 'antialiased',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#0f172a',
              lineHeight: '15px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {name}
          </div>
          {spouse && (
            <div
              style={{
                fontSize: 9.5,
                fontWeight: 400,
                color: '#64748b',
                lineHeight: '13px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              ♥ {spouseText}
            </div>
          )}
          {attrs.years && (
            <div
              style={{
                fontSize: 9,
                fontWeight: 400,
                color: '#94a3b8',
                lineHeight: '12px',
              }}
            >
              {attrs.years}
              {attrs.generation ? ` · Đời ${attrs.generation}` : ''}
            </div>
          )}
          {!attrs.years && attrs.generation && (
            <div
              style={{
                fontSize: 9,
                fontWeight: 400,
                color: '#94a3b8',
                lineHeight: '12px',
              }}
            >
              Đời {attrs.generation}
            </div>
          )}
        </div>
      </foreignObject>
    </g>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <Icon size={14} className="mt-0.5 shrink-0 text-slate-400" />
      <span className="w-20 shrink-0 text-slate-500">{label}</span>
      <span className="text-slate-800">{value}</span>
    </div>
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
        .filter((p) => p.id === 'root' || p.generation === 1 || personName(p).includes('Đàm Phú Lạc'))
        .sort((a, b) => (a.generation ?? 0) - (b.generation ?? 0)),
    [members]
  );

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return members
      .filter(
        (p) =>
          personName(p).toLowerCase().includes(q) ||
          (p.aliases ?? []).some((a) => a.toLowerCase().includes(q)) ||
          (p.notes ?? '').toLowerCase().includes(q)
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

  const maleCount = members.filter((p) => p.gender === 'male').length;
  const femaleCount = members.filter((p) => p.gender === 'female').length;

  const genderBadge = selected
    ? selected.gender === 'male'
      ? { label: 'Nam ♂', cls: 'bg-blue-100 text-blue-700 border-blue-200' }
      : selected.gender === 'female'
      ? { label: 'Nữ ♀', cls: 'bg-pink-100 text-pink-700 border-pink-200' }
      : { label: 'Chưa rõ', cls: 'bg-slate-100 text-slate-600 border-slate-200' }
    : null;

  const inputCls =
    'mt-1 h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:bg-white transition-colors';

  const controlsContent = (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      <div className="relative">
        <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
        <select
          value={rootId}
          onChange={(e) => { setRootId(e.target.value); setSelectedId(e.target.value); }}
          className="h-9 appearance-none rounded-lg border border-slate-700 bg-slate-800 pl-3 pr-7 text-sm text-white"
        >
          {rootOptions.map((p) => (
            <option key={p.id} value={p.id}>{personName(p)}</option>
          ))}
        </select>
      </div>

      <div className="flex rounded-lg border border-slate-700 bg-slate-800 p-0.5">
        <button
          type="button"
          onClick={() => setIsEditMode(false)}
          className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors ${
            !isEditMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Eye size={13} />
          Xem
        </button>
        <button
          type="button"
          onClick={() => setIsEditMode(true)}
          className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors ${
            isEditMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Pencil size={13} />
          Sửa
        </button>
      </div>

      {isEditMode && (
        <button
          type="button"
          onClick={downloadJson}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-emerald-500 px-3 text-sm font-medium text-white hover:bg-emerald-400 transition-colors"
        >
          <Download size={14} />
          Tải JSON
        </button>
      )}
      {isEditMode && (
        <button
          type="button"
          onClick={resetData}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          <RotateCcw size={14} />
          Hoàn tác
        </button>
      )}
    </div>
  );

  const selectedPanel = selected ? (
    <div className="space-y-5">
      {/* Person header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
            selected.gender === 'male' ? 'bg-blue-100 text-blue-600'
            : selected.gender === 'female' ? 'bg-pink-100 text-pink-600'
            : 'bg-slate-100 text-slate-500'
          }`}>
            <User size={20} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {isEditMode ? 'Chỉnh sửa' : 'Thông tin'}
            </p>
            <h2 className="text-lg font-bold leading-tight text-slate-900">{personName(selected)}</h2>
          </div>
        </div>
        {genderBadge && (
          <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${genderBadge.cls}`}>
            {genderBadge.label}
          </span>
        )}
      </div>

      {/* Edit action buttons */}
      {isEditMode && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={addChild}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            <Plus size={15} />
            Thêm con
          </button>
          <button
            type="button"
            onClick={addSpouse}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-pink-600 py-2 text-sm font-medium text-white hover:bg-pink-500 transition-colors"
          >
            <Heart size={15} />
            Thêm vợ/chồng
          </button>
        </div>
      )}

      {/* View mode */}
      {!isEditMode && (
        <div className="space-y-2.5 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <InfoRow icon={Hash} label="Đời thứ" value={selected.generation} />
          <InfoRow icon={Calendar} label="Năm sinh" value={selected.born} />
          <InfoRow icon={Calendar} label="Năm mất" value={selected.died} />
          <InfoRow icon={MapPin} label="Nơi sinh" value={selected.birthPlace} />
          <InfoRow icon={MapPin} label="Nơi mất" value={selected.deathPlace} />
          <InfoRow icon={GitBranch} label="Nhánh" value={selected.branch} />
          {selected.notes && (
            <div className="flex items-start gap-2.5 text-sm">
              <FileText size={14} className="mt-0.5 shrink-0 text-slate-400" />
              <div>
                <p className="mb-1 text-slate-500">Ghi chú</p>
                <p className="leading-relaxed text-slate-800">{selected.notes}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit mode form */}
      {isEditMode && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Họ tên</label>
            <input
              value={personName(selected)}
              onChange={(e) => updateField('name', e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Giới tính</label>
            <select
              value={selected.gender}
              onChange={(e) => updateField('gender', e.target.value as Gender)}
              className={inputCls + ' appearance-none bg-slate-50'}
            >
              <option value="male">Nam ♂</option>
              <option value="female">Nữ ♀</option>
              <option value="unknown">Chưa rõ</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Đời</label>
              <input value={selected.generation ?? ''} onChange={(e) => updateField('generation', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Sinh</label>
              <input value={selected.born ?? ''} onChange={(e) => updateField('born', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Mất</label>
              <input value={selected.died ?? ''} onChange={(e) => updateField('died', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Nhánh</label>
            <input value={selected.branch} onChange={(e) => updateField('branch', e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Nơi sinh</label>
            <input value={selected.birthPlace} onChange={(e) => updateField('birthPlace', e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Nơi mất</label>
            <input value={selected.deathPlace} onChange={(e) => updateField('deathPlace', e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Ghi chú</label>
            <textarea
              value={selected.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:bg-white transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-400">
      <TreePine size={40} className="opacity-30" />
      <p className="text-sm">Chọn một người trên cây để xem thông tin</p>
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-slate-100 text-slate-950">
      {/* Header */}
      <header className="shrink-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-3 shadow-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-slate-900 shadow-sm">
              <TreePine size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight text-white">Gia Phả Họ Đàm</h1>
              <p className="text-[11px] text-slate-400">
                {members.length} người &middot; {maleCount} nam &middot; {femaleCount} nữ
              </p>
            </div>
          </div>

          <div className="hidden lg:block">{controlsContent}</div>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700 text-white hover:bg-slate-600 lg:hidden"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />
          <div className="absolute right-0 top-0 flex h-full w-[min(92vw,380px)] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="font-semibold text-slate-900">Menu</p>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <X size={16} />
              </button>
            </div>
            <div className="border-b border-slate-100 bg-slate-900 p-4">{controlsContent}</div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">{selectedPanel}</div>
          </div>
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_360px]">
        {/* Tree canvas */}
        <section className="relative min-h-[56vh] overflow-hidden bg-slate-50 lg:min-h-0">
          {/* Subtle dot grid background */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              opacity: 0.5,
            }}
          />

          {/* Search box */}
          <div className="absolute left-3 top-3 z-10 w-[calc(100%-1.5rem)] max-w-sm">
            <div className="rounded-xl border border-slate-200 bg-white/95 shadow-lg backdrop-blur">
              <div className="flex items-center gap-2 px-3 py-2">
                <Search size={15} className="shrink-0 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm tên, tên khác, ghi chú..."
                  className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                )}
              </div>
              {searchResults.length > 0 && (
                <div className="border-t border-slate-100">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setSelectedId(p.id); setQuery(''); }}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-xs ${
                        p.gender === 'male' ? 'bg-blue-100 text-blue-600'
                        : p.gender === 'female' ? 'bg-pink-100 text-pink-600'
                        : 'bg-slate-100 text-slate-500'
                      }`}>
                        <User size={12} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{personName(p)}</p>
                        <p className="text-xs text-slate-500">Đời {p.generation ?? '?'}{p.born ? ` · ${p.born}` : ''}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div ref={onContainerRef} className="h-full min-h-[56vh] w-full lg:min-h-0">
            {treeData ? (
              <Tree
                data={treeData as unknown as RawNodeDatum}
                orientation="vertical"
                translate={translate}
                nodeSize={{ x: 196, y: 125 }}
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

        {/* Sidebar */}
        <aside className="hidden min-h-0 overflow-y-auto border-l border-slate-200 bg-white lg:block">
          <div className="p-5">{selectedPanel}</div>
        </aside>
      </div>
    </div>
  );
}
