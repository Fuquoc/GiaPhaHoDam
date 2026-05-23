'use client';
import Link from 'next/link';
import type { Person } from '@/lib/data/types';
import PersonCard from './PersonCard';
import { Calendar, MapPin, GitBranch, Hash, FileText, ArrowLeft, Users, Heart, Baby, UserCircle2, TreePine } from 'lucide-react';

interface Props {
  person: Person;
  father: Person | null;
  mother: Person | null;
  spouses: Person[];
  childMembers: Person[];
  siblings: Person[];
}

function Section({ title, icon: Icon, items }: { title: string; icon: React.ElementType; items: Person[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-5">
      <div className="mb-2.5 flex items-center gap-2">
        <Icon size={14} className="text-slate-400" />
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</h3>
        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">{items.length}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((p) => <PersonCard key={p.id} person={p} compact />)}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon size={14} className="mt-0.5 shrink-0 text-slate-400" />
      <span className="w-24 shrink-0 text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}

export default function FamilyDetail({ person, father, mother, spouses, childMembers, siblings }: Props) {
  const isMale = person.gender === 'male';
  const isFemale = person.gender === 'female';
  const genderLabel = isMale ? 'Nam ♂' : isFemale ? 'Nữ ♀' : 'Chưa rõ';
  const avatarBg = isMale ? 'bg-blue-100 text-blue-600' : isFemale ? 'bg-pink-100 text-pink-600' : 'bg-slate-100 text-slate-500';
  const genderBadgeCls = isMale ? 'bg-blue-100 text-blue-700 border-blue-200' : isFemale ? 'bg-pink-100 text-pink-700 border-pink-200' : 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back nav */}
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft size={14} />
        Về trang chủ
      </Link>

      {/* Main card */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Card header band */}
        <div className={`h-2 w-full ${isMale ? 'bg-gradient-to-r from-blue-400 to-blue-600' : isFemale ? 'bg-gradient-to-r from-pink-400 to-pink-600' : 'bg-gradient-to-r from-slate-300 to-slate-400'}`} />

        <div className="p-6">
          <div className="mb-5 flex items-start gap-4">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${avatarBg}`}>
              <UserCircle2 size={32} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{person.name}</h1>
                  {person.generation && (
                    <p className="mt-0.5 text-sm text-slate-500">Đời thứ {person.generation}</p>
                  )}
                </div>
                <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${genderBadgeCls}`}>
                  {genderLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 border-t border-slate-100 pt-5">
            <InfoRow icon={Hash} label="Đời thứ" value={person.generation} />
            <InfoRow icon={Calendar} label="Năm sinh" value={person.born} />
            <InfoRow icon={Calendar} label="Năm mất" value={person.died} />
            <InfoRow icon={MapPin} label="Nơi sinh" value={person.birthPlace} />
            <InfoRow icon={MapPin} label="Nơi mất" value={person.deathPlace} />
            <InfoRow icon={GitBranch} label="Nhánh" value={person.branch} />
            {person.aliases.length > 0 && (
              <InfoRow icon={UserCircle2} label="Tên khác" value={person.aliases.join(', ')} />
            )}
          </div>

          {person.notes && (
            <div className="mt-5 flex gap-3 rounded-xl bg-amber-50 p-4 text-sm">
              <FileText size={15} className="mt-0.5 shrink-0 text-amber-500" />
              <div>
                <p className="mb-1 font-semibold text-amber-700">Ghi chú</p>
                <p className="leading-relaxed text-slate-700">{person.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Relations card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <TreePine size={16} className="text-slate-400" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Quan hệ gia đình</h2>
        </div>

        {(father || mother) && (
          <div className="mb-5">
            <div className="mb-2.5 flex items-center gap-2">
              <Users size={14} className="text-slate-400" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Cha / Mẹ</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {father && <PersonCard person={father} compact />}
              {mother && <PersonCard person={mother} compact />}
            </div>
          </div>
        )}

        <Section title="Vợ / Chồng" icon={Heart} items={spouses} />
        <Section title="Con cái" icon={Baby} items={childMembers} />
        <Section title="Anh chị em" icon={Users} items={siblings} />
      </div>
    </div>
  );
}
