import { notFound } from 'next/navigation';
import { getDataSource } from '@/lib/data';
import FamilyDetail from '@/components/FamilyDetail';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PersonPage({ params }: Props) {
  const { id } = await params;
  const ds = getDataSource();

  const person = await ds.getById(id);
  if (!person) notFound();

  const [father, mother, spouses, children, all] = await Promise.all([
    person.fatherId ? ds.getById(person.fatherId) : Promise.resolve(null),
    person.motherId ? ds.getById(person.motherId) : Promise.resolve(null),
    ds.getSpouses(id),
    ds.getChildren(id),
    ds.getAll(),
  ]);

  const siblings = all.filter(
    (p) =>
      p.id !== id &&
      ((person.fatherId && p.fatherId === person.fatherId) ||
        (person.motherId && p.motherId === person.motherId))
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <FamilyDetail
        person={person}
        father={father ?? null}
        mother={mother ?? null}
        spouses={spouses}
        childMembers={children}
        siblings={siblings}
      />
    </main>
  );
}

export async function generateStaticParams() {
  const ds = getDataSource();
  const all = await ds.getAll();
  return all.map((p) => ({ id: p.id }));
}
