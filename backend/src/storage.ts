import { Submission } from './types';

class InMemoryStorage {
  private submissions: Submission[] = [];

  add(submission: Submission): void {
    this.submissions.push(submission);
  }

  getAll(): Submission[] {
    return [...this.submissions];
  }

  getById(id: string): Submission | undefined {
    return this.submissions.find(s => s.id === id);
  }

  update(id: string, data: Record<string, any>): boolean {
    const submission = this.submissions.find(s => s.id === id);
    if (submission) {
      submission.data = data;
      return true;
    }
    return false;
  }

  delete(id: string): boolean {
    const index = this.submissions.findIndex(s => s.id === id);
    if (index !== -1) {
      this.submissions.splice(index, 1);
      return true;
    }
    return false;
  }

  getCount(): number {
    return this.submissions.length;
  }
}

export const storage = new InMemoryStorage();

