import familyData from '@/data/family.json';
import { JsonDataSource } from './json-source';
import type { IDataSource, FamilyData } from './types';

// Swap this export to switch data sources:
// import { SqliteDataSource } from './sqlite-source';   // Option A
// import { SupabaseDataSource } from './supabase-source'; // Option B

let instance: IDataSource | null = null;

export function getDataSource(): IDataSource {
  if (!instance) {
    instance = new JsonDataSource(familyData as FamilyData);
  }
  return instance;
}

export * from './types';
