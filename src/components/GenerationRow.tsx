'use client';
import type { Person } from '@/lib/data/types';
import PersonCard from './PersonCard';

interface Props {
  generation: number;
  members: Person[];
  highlightId?: string;
}

export default function GenerationRow({ generation, members, highlightId }: Props) {
  if (members.length === 0) return null;
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded">
          Đời {generation}
        </span>
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">{members.length} người</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {members.map((p) => (
          <PersonCard key={p.id} person={p} compact highlighted={p.id === highlightId} />
        ))}
      </div>
    </div>
  );
}
