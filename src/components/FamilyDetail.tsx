'use client';
import Link from 'next/link';
import type { Person } from '@/lib/data/types';
import PersonCard from './PersonCard';

interface Props {
  person: Person;
  father: Person | null;
  mother: Person | null;
  spouses: Person[];
  childMembers: Person[];
  siblings: Person[];
}

function Section({ title, items }: { title: string; items: Person[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((p) => <PersonCard key={p.id} person={p} compact />)}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-500 w-28 flex-shrink-0">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}

export default function FamilyDetail({ person, father, mother, spouses, childMembers, siblings }: Props) {
  const genderLabel = { male: 'Nam', female: 'Nữ', unknown: 'Chưa rõ' }[person.gender];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{person.name}</h1>
            {person.generation && (
              <span className="text-sm text-gray-500">Đời thứ {person.generation}</span>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            person.gender === 'male' ? 'bg-blue-100 text-blue-700' :
            person.gender === 'female' ? 'bg-pink-100 text-pink-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {genderLabel}
          </span>
        </div>

        <div className="space-y-1.5 border-t pt-4">
          <InfoRow label="Năm sinh" value={person.born} />
          <InfoRow label="Năm mất" value={person.died} />
          <InfoRow label="Nơi sinh" value={person.birthPlace} />
          <InfoRow label="Nơi mất" value={person.deathPlace} />
          <InfoRow label="Nhánh" value={person.branch} />
          {person.aliases.length > 0 && (
            <InfoRow label="Tên khác" value={person.aliases.join(', ')} />
          )}
        </div>

        {person.notes && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-gray-700">
            <span className="font-medium text-yellow-700">Ghi chú: </span>{person.notes}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {(father || mother) && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Cha / Mẹ</h3>
            <div className="flex flex-wrap gap-2">
              {father && <PersonCard person={father} compact />}
              {mother && <PersonCard person={mother} compact />}
            </div>
          </div>
        )}
        <Section title="Vợ / Chồng" items={spouses} />
        <Section title="Con cái" items={childMembers} />
        <Section title="Anh chị em" items={siblings} />
      </div>

      <div className="mt-4">
        <Link href="/" className="text-sm text-blue-600 hover:underline">← Về trang chủ</Link>
      </div>
    </div>
  );
}
