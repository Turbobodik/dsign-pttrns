import type { Book, BookSnapshot } from '../domain/Book';
import { FictionBook } from '../domain/FictionBook';
import { Textbook } from '../domain/Textbook';

const STORAGE_KEY = 'task4.library.books';

export interface CollectedFine {
  id: string;
  bookTitle: string;
  readerName: string;
  daysOverdue: number;
  amount: number;
  paidAt: string;
}

interface StoredLibrary {
  books: BookSnapshot[];
  fines: CollectedFine[];
  clock: string | null;
}

export class LibraryStorage {
  load(): { books: Book[]; fines: CollectedFine[]; clock: string | null } {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { books: [], fines: [], clock: null };
      const parsed = JSON.parse(raw) as StoredLibrary | BookSnapshot[];
      if (Array.isArray(parsed)) {
        return { books: parsed.map(fromSnapshot), fines: [], clock: null };
      }
      return {
        books: (parsed.books ?? []).map(fromSnapshot),
        fines: parsed.fines ?? [],
        clock: parsed.clock ?? null,
      };
    } catch {
      return { books: [], fines: [], clock: null };
    }
  }

  save(books: Book[], fines: CollectedFine[], clock: string | null): void {
    const payload: StoredLibrary = {
      books: books.map((book) => book.toSnapshot()),
      fines,
      clock,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function fromSnapshot(snapshot: BookSnapshot): Book {
  if (snapshot.kind === 'fiction') return FictionBook.fromSnapshot(snapshot);
  return Textbook.fromSnapshot(snapshot);
}
