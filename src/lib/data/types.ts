export type Gender = 'male' | 'female' | 'unknown';

export interface Person {
  id: string;
  name: string;
  gender: Gender;
  born: number | null;
  died: number | null;
  birthPlace: string;
  deathPlace: string;
  fatherId: string | null;
  motherId: string | null;
  spouseIds: string[];
  childrenIds: string[];
  generation: number | null;
  branch: string;
  photo: string;
  aliases: string[];
  notes: string;
}

export interface FamilyData {
  members: Person[];
}

// Interface for swappable data sources (JSON → SQLite → Supabase)
export interface IDataSource {
  getAll(): Promise<Person[]>;
  getById(id: string): Promise<Person | undefined>;
  search(query: string): Promise<Person[]>;
  getByGeneration(gen: number): Promise<Person[]>;
  getByBranch(branch: string): Promise<Person[]>;
  getChildren(personId: string): Promise<Person[]>;
  getSpouses(personId: string): Promise<Person[]>;
}
