export interface Fsclient {
  _id: string;
  name: string;
  age: number;
  company: string;
  email: string;
  avatar?: string;
  role: FsclientRole;
}

export type FsclientRole = 'admin' | 'editor' | 'viewer';
