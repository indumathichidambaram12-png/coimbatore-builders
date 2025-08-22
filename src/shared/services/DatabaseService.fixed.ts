import { SQLiteConnection, SQLiteDBConnection, CapacitorSQLite, capSQLiteChanges } from '@capacitor-community/sqlite';

const DB_NAME = 'coimbatore_builders.db';

export class DatabaseService {
  private static instance: DatabaseService;
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private initialized = false;

  private constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      const ret = await this.sqlite.checkConnectionsConsistency();
      const isConn = (await this.sqlite.isConnection(DB_NAME, false)).result;
      
      if (ret.result && isConn) {
        this.db = await this.sqlite.retrieveConnection(DB_NAME, false);
      } else {
        this.db = await this.sqlite.createConnection(
          DB_NAME,
          false,
          'no-encryption',
          1,
          false
        );
      }

      await this.db.open();
      
      // Run migrations
      const migrations = await this.loadMigrations();
      for (const migration of migrations) {
        await this.db.execute(migration);
      }

      this.initialized = true;
    } catch (err) {
      console.error('Error initializing database:', err);
      throw err;
    }
  }

  private async loadMigrations(): Promise<string[]> {
    try {
      const response = await fetch('/migrations/1.sql');
      const migration1 = await response.text();
      
      const response2 = await fetch('/migrations/2.sql');
      const migration2 = await response2.text();
      
      return [migration1, migration2];
    } catch (err) {
      console.error('Error loading migrations:', err);
      throw err;
    }
  }

  private getInsertId(result: capSQLiteChanges): number {
    return typeof result.changes === 'number' ? result.changes : 0;
  }

  async getWorkers() {
    if (!this.db) throw new Error('Database not initialized');
    const query = 'SELECT * FROM workers WHERE is_active = 1';
    const result = await this.db.query(query);
    return result.values || [];
  }

  async addWorker(worker: {
    name: string;
    labour_type: string;
    phone_number?: string;
    aadhaar_id?: string;
    daily_wage: number;
    hourly_rate?: number;
    upi_id?: string;
    project_id?: number;
  }): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const query = `
      INSERT INTO workers (
        name, labour_type, phone_number, aadhaar_id, 
        daily_wage, hourly_rate, upi_id, project_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      worker.name,
      worker.labour_type,
      worker.phone_number || null,
      worker.aadhaar_id || null,
      worker.daily_wage,
      worker.hourly_rate || null,
      worker.upi_id || null,
      worker.project_id || null
    ];

    const result = await this.db.run(query, values);
    return this.getInsertId(result);
  }

  async markAttendance(attendance: {
    worker_id: number;
    project_id: number;
    attendance_date: string;
    status: 'full' | 'half' | 'absent';
    hours_worked?: number;
    notes?: string;
  }): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const query = `
      INSERT INTO attendance (
        worker_id, project_id, attendance_date,
        status, hours_worked, notes
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      attendance.worker_id,
      attendance.project_id,
      attendance.attendance_date,
      attendance.status,
      attendance.hours_worked || null,
      attendance.notes || null
    ];

    const result = await this.db.run(query, values);
    return this.getInsertId(result);
  }

  async getAttendance(date: string) {
    if (!this.db) throw new Error('Database not initialized');
    
    const query = `
      SELECT a.*, w.name as worker_name, w.labour_type
      FROM attendance a
      JOIN workers w ON a.worker_id = w.id
      WHERE attendance_date = ?
    `;
    
    const result = await this.db.query(query, [date]);
    return result.values || [];
  }

  async recordPayment(payment: {
    worker_id: number;
    project_id: number;
    amount: number;
    payment_type: 'wage' | 'advance' | 'bonus' | 'deduction';
    payment_date: string;
    payment_period_start?: string;
    payment_period_end?: string;
  }): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const query = `
      INSERT INTO payments (
        worker_id, project_id, amount, payment_type,
        payment_date, payment_period_start, payment_period_end
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      payment.worker_id,
      payment.project_id,
      payment.amount,
      payment.payment_type,
      payment.payment_date,
      payment.payment_period_start || null,
      payment.payment_period_end || null
    ];

    const result = await this.db.run(query, values);
    return this.getInsertId(result);
  }

  async getPayments(workerId: number) {
    if (!this.db) throw new Error('Database not initialized');
    
    const query = `
      SELECT * FROM payments
      WHERE worker_id = ?
      ORDER BY payment_date DESC
    `;
    
    const result = await this.db.query(query, [workerId]);
    return result.values || [];
  }

  async getProjects() {
    if (!this.db) throw new Error('Database not initialized');
    
    const query = 'SELECT * FROM projects WHERE status = "active"';
    const result = await this.db.query(query);
    return result.values || [];
  }

  async addProject(project: {
    name: string;
    location?: string;
  }): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const query = `
      INSERT INTO projects (name, location)
      VALUES (?, ?)
    `;
    
    const values = [
      project.name,
      project.location || null
    ];

    const result = await this.db.run(query, values);
    return this.getInsertId(result);
  }
}
