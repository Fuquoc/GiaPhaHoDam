import { getDataSource } from '@/lib/data';
import FamilyTreeWorkspace from '@/components/FamilyTreeWorkspace';

export default async function TreePage() {
  const ds = getDataSource();
  const all = await ds.getAll();

  return <FamilyTreeWorkspace initialMembers={all} />;
}
