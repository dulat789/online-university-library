export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  year: number;
  cover_url?: string | null;
  total_copies: number;
  available_copies: number;
  created_at: string;
}
