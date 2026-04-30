import type { User } from '../../types';

export type ManualUserRole = User['role'];

export interface ManualSection {
  id: string;
  title: string;
  paragraphs: string[];
}
