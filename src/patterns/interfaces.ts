// Abstract Factory Pattern interfaces
export interface ITimeEntry {
  id: string;
  userId: string;
  startTime: Date;
  endTime: Date | null;
  type: 'regular' | 'overtime';
}

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'employee' | 'admin';
  hourlyRate: number;
}

// Abstract Factory
export interface TimeEntryFactory {
  createRegularTimeEntry(userId: string, startTime: Date): ITimeEntry;
  createOvertimeTimeEntry(userId: string, startTime: Date): ITimeEntry;
}

// Command Pattern interfaces
export interface Command {
  execute(): Promise<void>;
  undo(): Promise<void>;
}

// Decorator Pattern interfaces
export interface TimeEntryDecorator {
  calculate(): number;
  getDescription(): string;
}