import type { Person } from './data/types';

export interface TreeNode {
  name: string;
  attributes: {
    id: string;
    spouse: string;
    years: string;
    gender: string;
    generation: number | string;
  };
  children?: TreeNode[];
}

export function buildTree(
  personId: string,
  personMap: Map<string, Person>,
  visited = new Set<string>()
): TreeNode | null {
  if (visited.has(personId)) return null;
  visited.add(personId);

  const person = personMap.get(personId);
  if (!person) return null;

  const spouseName = person.spouseIds
    .map((sid) => personMap.get(sid)?.name)
    .filter(Boolean)
    .join(' & ');

  const years =
    person.born || person.died
      ? `${person.born ?? '?'} – ${person.died ?? ''}`
      : '';

  // Only recurse into children where this person is listed as father
  // (avoids duplicating nodes when mother is also in the tree)
  const children: TreeNode[] = [];
  for (const childId of person.childrenIds) {
    const child = personMap.get(childId);
    if (!child) continue;
    // Only descend if this person is the father (or if child has no father recorded)
    if (child.fatherId === personId || (!child.fatherId && child.motherId === personId)) {
      const node = buildTree(childId, personMap, new Set(visited));
      if (node) children.push(node);
    }
  }

  return {
    name: person.name,
    attributes: {
      id: person.id,
      spouse: spouseName,
      years,
      gender: person.gender,
      generation: person.generation ?? '',
    },
    children: children.length > 0 ? children : undefined,
  };
}

export function personsToMap(persons: Person[]): Map<string, Person> {
  return new Map(persons.map((p) => [p.id, p]));
}
