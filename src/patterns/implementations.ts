import { ITimeEntry, TimeEntryFactory, Command, TimeEntryDecorator } from './interfaces';
import { mockDb } from '../lib/mockData';

// Concrete Factory implementation
export class MockTimeEntryFactory implements TimeEntryFactory {
  createRegularTimeEntry(userId: string, startTime: Date): ITimeEntry {
    return {
      id: crypto.randomUUID(),
      userId,
      startTime,
      endTime: null,
      type: 'regular'
    };
  }

  createOvertimeTimeEntry(userId: string, startTime: Date): ITimeEntry {
    return {
      id: crypto.randomUUID(),
      userId,
      startTime,
      endTime: null,
      type: 'overtime'
    };
  }
}

// Command Pattern implementations
export class StartTimeEntryCommand implements Command {
  constructor(
    private timeEntry: ITimeEntry,
  ) {}

  async execute(): Promise<void> {
    mockDb.addTimeEntry(this.timeEntry);
  }

  async undo(): Promise<void> {
    // Implementation not needed for mock
  }
}

// Decorator Pattern implementations remain the same
export class BaseTimeEntry implements TimeEntryDecorator {
  constructor(protected timeEntry: ITimeEntry) {}

  calculate(): number {
    if (!this.timeEntry.endTime) return 0;
    const hours = (this.timeEntry.endTime.getTime() - this.timeEntry.startTime.getTime()) / (1000 * 60 * 60);
    return hours;
  }

  getDescription(): string {
    return `Regular time entry`;
  }
}

export class OvertimeDecorator implements TimeEntryDecorator {
  constructor(private wrapped: TimeEntryDecorator) {}

  calculate(): number {
    return this.wrapped.calculate() * 1.5; // 50% overtime premium
  }

  getDescription(): string {
    return `${this.wrapped.getDescription()} with overtime`;
  }
}