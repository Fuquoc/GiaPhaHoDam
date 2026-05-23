import { IDataSource, Person } from './types';

// Option C: JSON file as data source.
// To upgrade to SQLite (Option A): replace this file with sqlite-source.ts
// To upgrade to Supabase (Option B): replace this file with supabase-source.ts
export class JsonDataSource implements IDataSource {
  private members: Person[];

  constructor(data: { members: Person[] }) {
    this.members = data.members;
  }

  async getAll(): Promise<Person[]> {
    return this.members;
  }

  async getById(id: string): Promise<Person | undefined> {
    return this.members.find((p) => p.id === id);
  }

  async search(query: string): Promise<Person[]> {
    const q = query.toLowerCase().trim();
    if (!q) return this.members;
    return this.members.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.aliases.some((a) => a.toLowerCase().includes(q)) ||
        p.notes.toLowerCase().includes(q)
    );
  }

  async getByGeneration(gen: number): Promise<Person[]> {
    return this.members.filter((p) => p.generation === gen);
  }

  async getByBranch(branch: string): Promise<Person[]> {
    return this.members.filter((p) => p.branch === branch);
  }

  async getChildren(personId: string): Promise<Person[]> {
    return this.members.filter((p) => p.fatherId === personId || p.motherId === personId);
  }

  async getSpouses(personId: string): Promise<Person[]> {
    const person = this.members.find((p) => p.id === personId);
    if (!person) return [];
    return this.members.filter((p) => person.spouseIds.includes(p.id));
  }
}
