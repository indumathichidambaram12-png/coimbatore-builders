import { DatabaseService } from './DatabaseService';
import { WorkerType, ProjectType, AttendanceType, PaymentType } from '@/shared/types';

const db = DatabaseService.getInstance();

interface SQLiteResponse {
  values?: any[];
  changes?: number;
}

// Local storage based API service that uses SQLite
export const apiService = {
  init: async () => {
    await db.init();
  },
  // Workers
  workers: {
    getAll: async (): Promise<WorkerType[]> => {
      const workers = await db.query<WorkerType[]>('SELECT * FROM workers WHERE is_active = 1');
      return workers || [];
    },
    getById: async (id: number): Promise<WorkerType | undefined> => {
      const workers = await db.query<WorkerType[]>('SELECT * FROM workers WHERE id = ? AND is_active = 1', [id]);
      return workers?.[0];
    },
    create: async (data: Omit<WorkerType, 'id'>): Promise<WorkerType> => {
      const result = await db.execute(
        'INSERT INTO workers (name, labour_type, phone_number, aadhaar_id, daily_wage, hourly_rate, upi_id, project_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [data.name, data.labour_type, data.phone_number, data.aadhaar_id, data.daily_wage, data.hourly_rate, data.upi_id, data.project_id]
      );
      return { ...data, id: result.lastInsertId };
    },
    update: async (id: number, data: Partial<WorkerType>): Promise<WorkerType> => {
      await db.execute(
        'UPDATE workers SET name = ?, labour_type = ?, phone_number = ?, aadhaar_id = ?, daily_wage = ?, hourly_rate = ?, upi_id = ?, project_id = ? WHERE id = ?',
        [data.name, data.labour_type, data.phone_number, data.aadhaar_id, data.daily_wage, data.hourly_rate, data.upi_id, data.project_id, id]
      );
      return { ...data, id } as WorkerType;
    },
    delete: async (id: number): Promise<{ success: boolean }> => {
      await db.execute('UPDATE workers SET is_active = 0 WHERE id = ?', [id]);
      return { success: true };
    },
  },

  // Projects
  projects: {
    getAll: async () => {
      await db.init();
      return db.getProjects();
    },
    getById: async (id: number) => {
      await db.init();
      const projects = await db.getProjects();
      return projects.find(p => p.id === id);
    },
    create: async (data: any) => {
      await db.init();
      const id = await db.addProject(data);
      return { ...data, id };
    },
    update: async (id: number, data: any) => {
      await db.init();
      await db.run(
        'UPDATE projects SET name = ?, location = ?, status = ? WHERE id = ?',
        [data.name, data.location, data.status, id]
      );
      return { ...data, id };
    },
    delete: async (id: number) => {
      await db.init();
      await db.run('UPDATE projects SET status = ? WHERE id = ?', ['inactive', id]);
      return { success: true };
    },
  },

  // Attendance
  attendance: {
    getByDate: async (date: string) => {
      await db.init();
      return db.getAttendance(date);
    },
    markAttendance: async (data: any) => {
      await db.init();
      const id = await db.markAttendance(data);
      return { ...data, id };
    },
    updateAttendance: async (id: number, data: any) => {
      await db.init();
      await db.run(
        'UPDATE attendance SET status = ?, hours_worked = ?, notes = ? WHERE id = ?',
        [data.status, data.hours_worked, data.notes, id]
      );
      return { ...data, id };
    },
  },

  // Payments
  payments: {
    getByWorker: async (workerId: number) => {
      await db.init();
      return db.getPayments(workerId);
    },
    create: async (data: any) => {
      await db.init();
      const id = await db.recordPayment(data);
      return { ...data, id };
    },
    update: async (id: number, data: any) => {
      await db.init();
      await db.run(
        'UPDATE payments SET amount = ?, payment_type = ?, payment_date = ?, payment_period_start = ?, payment_period_end = ? WHERE id = ?',
        [data.amount, data.payment_type, data.payment_date, data.payment_period_start, data.payment_period_end, id]
      );
      return { ...data, id };
    },
  },
};
