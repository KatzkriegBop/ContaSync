import { IUser, ITimeEntry } from '../patterns/interfaces';

// Mock data store with local storage persistence
class MockDataStore {
  private static instance: MockDataStore;
  private users: IUser[] = [];
  private timeEntries: ITimeEntry[] = [];

  private constructor() {
    // Clear existing data to ensure we always start fresh
    localStorage.removeItem('users');
    localStorage.removeItem('timeEntries');
    
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize with default users
    this.users = [
      {
        id: '1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        hourlyRate: 50
      },
      {
        id: '2',
        email: 'employee@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'employee',
        hourlyRate: 25
      },
      {
        id: '3',
        email: 'sarah.wilson@example.com',
        firstName: 'Sarah',
        lastName: 'Wilson',
        role: 'employee',
        hourlyRate: 28
      },
      {
        id: '4',
        email: 'michael.brown@example.com',
        firstName: 'Michael',
        lastName: 'Brown',
        role: 'employee',
        hourlyRate: 26
      },
      {
        id: '5',
        email: 'emily.davis@example.com',
        firstName: 'Emily',
        lastName: 'Davis',
        role: 'employee',
        hourlyRate: 27
      },
      {
        id: '6',
        email: 'david.miller@example.com',
        firstName: 'David',
        lastName: 'Miller',
        role: 'employee',
        hourlyRate: 25
      },
      {
        id: '7',
        email: 'lisa.taylor@example.com',
        firstName: 'Lisa',
        lastName: 'Taylor',
        role: 'employee',
        hourlyRate: 29
      }
    ];

    // Initialize time entries
    this.timeEntries = [
      // Sarah Wilson - Complete 8-hour shift on 05/02/2025
      {
        id: crypto.randomUUID(),
        userId: '3',
        startTime: new Date('2025-02-05T09:00:00'),
        endTime: new Date('2025-02-05T17:00:00'),
        type: 'regular'
      },
      
      // Michael Brown - 4-hour shift on 04/02/2025
      {
        id: crypto.randomUUID(),
        userId: '4',
        startTime: new Date('2025-02-04T09:00:00'),
        endTime: new Date('2025-02-04T13:00:00'),
        type: 'regular'
      },

      // Emily Davis - Random shifts
      {
        id: crypto.randomUUID(),
        userId: '5',
        startTime: new Date('2025-02-03T10:00:00'),
        endTime: new Date('2025-02-03T16:30:00'),
        type: 'regular'
      },
      {
        id: crypto.randomUUID(),
        userId: '5',
        startTime: new Date('2025-02-05T09:00:00'),
        endTime: new Date('2025-02-05T14:00:00'),
        type: 'regular'
      },

      // David Miller - Random shifts with some overtime
      {
        id: crypto.randomUUID(),
        userId: '6',
        startTime: new Date('2025-02-04T08:00:00'),
        endTime: new Date('2025-02-04T18:00:00'),
        type: 'overtime'
      },
      {
        id: crypto.randomUUID(),
        userId: '6',
        startTime: new Date('2025-02-06T09:00:00'),
        endTime: new Date('2025-02-06T17:00:00'),
        type: 'regular'
      },

      // Lisa Taylor - Random shifts including a current active shift
      {
        id: crypto.randomUUID(),
        userId: '7',
        startTime: new Date('2025-02-03T09:00:00'),
        endTime: new Date('2025-02-03T15:00:00'),
        type: 'regular'
      },
      {
        id: crypto.randomUUID(),
        userId: '7',
        startTime: new Date('2025-02-05T09:00:00'),
        endTime: null, // Active shift
        type: 'regular'
      }
    ];

    this.saveToLocalStorage();
  }

  private loadFromLocalStorage() {
    try {
      const usersData = localStorage.getItem('users');
      const timeEntriesData = localStorage.getItem('timeEntries');
      
      if (usersData) {
        this.users = JSON.parse(usersData);
      }
      
      if (timeEntriesData) {
        // Convert string dates back to Date objects
        this.timeEntries = JSON.parse(timeEntriesData, (key, value) => {
          if (key === 'startTime' || key === 'endTime') {
            return value ? new Date(value) : null;
          }
          return value;
        });
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem('users', JSON.stringify(this.users));
      localStorage.setItem('timeEntries', JSON.stringify(this.timeEntries));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }

  public static getInstance(): MockDataStore {
    if (!MockDataStore.instance) {
      MockDataStore.instance = new MockDataStore();
    }
    return MockDataStore.instance;
  }

  // User methods
  getUsers(): IUser[] {
    return this.users;
  }

  getUserById(id: string): IUser | undefined {
    return this.users.find(user => user.id === id);
  }

  // Time entry methods
  getTimeEntries(): ITimeEntry[] {
    return this.timeEntries;
  }

  addTimeEntry(entry: ITimeEntry): void {
    this.timeEntries.push(entry);
    this.saveToLocalStorage();
  }

  updateTimeEntry(id: string, updates: Partial<ITimeEntry>): void {
    const index = this.timeEntries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      this.timeEntries[index] = { ...this.timeEntries[index], ...updates };
      this.saveToLocalStorage();
    }
  }

  getTimeEntriesByUserId(userId: string): ITimeEntry[] {
    return this.timeEntries.filter(entry => entry.userId === userId);
  }

  // Clear all data (useful for testing)
  clearData(): void {
    this.users = [];
    this.timeEntries = [];
    this.saveToLocalStorage();
  }
}

export const mockDb = MockDataStore.getInstance();