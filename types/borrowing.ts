export interface CurrentBorrowing {
  borrowing_id: number;
  book_id: number;
  title: string;
  author: string;
  borrow_date: string;
  due_date: string;
  return_date: null;
  is_overdue: boolean;
}

export interface BorrowHistory {
  borrowing_id: number;
  book_id: number;
  title: string;
  author: string;
  borrow_date: string;
  due_date: string;
  return_date: string;
}

export interface MyBooksResponse {
  current: CurrentBorrowing[];
  history: BorrowHistory[];
}
