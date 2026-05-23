'use client';
import Link from 'next/link';
import type { Person } from '@/lib/data/types';

interface Props {
  person: Person;
  compact?: boolean;
  highlighted?: boolean;
}

const genderColor = {
  male: 'bg-blue-50 border-blue-300 hover:border-blue-500',
  female: 'bg-pink-50 border-pink-300 hover:border-pink-500',
  unknown: 'bg-gray-50 border-gray-300 hover:border-gray-500',
};

const genderDot = {
  male: 'bg-blue-400',
  female: 'bg-pink-400',
  unknown: 'bg-gray-400',
};

export default function PersonCard({ person, compact = false, highlighted = false }: Props) {
  const baseClass = `border-2 rounded-lg cursor-pointer transition-all duration-150 ${genderColor[person.gender]}`;
  const ring = highlighted ? 'ring-2 ring-yellow-400 ring-offset-1' : '';

  if (compact) {
    return (
      <Link href={`/person/${person.id}`}>
        <div className={`${baseClass} ${ring} px-2 py-1 text-center min-w-[100px] max-w-[140px]`}>
          <span className={`inline-block w-2 h-2 rounded-full mr-1 ${genderDot[person.gender]}`} />
          <span className="text-xs font-medium text-gray-800 leading-tight">{person.name}</span>
          {person.born && <div className="text-[10px] text-gray-500">{person.born}{person.died ? `–${person.died}` : ''}</div>}
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/person/${person.id}`}>
      <div className={`${baseClass} ${ring} p-3 shadow-sm`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${genderDot[person.gender]}`} />
          <span className="font-semibold text-gray-900 text-sm">{person.name}</span>
        </div>
        {(person.born || person.died) && (
          <div className="text-xs text-gray-500 ml-5">
            {person.born ?? '?'} {person.died ? `– ${person.died}` : ''}
          </div>
        )}
        {person.generation && (
          <div className="text-xs text-gray-400 ml-5">Đời thứ {person.generation}</div>
        )}
      </div>
    </Link>
  );
}
