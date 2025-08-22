import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { 
  CreateProjectSchema,
  CreateWorkerSchema,
  CreateAttendanceSchema,
  CreatePaymentSchema
} from "../shared/types";
import upload from "./upload";

const app = new Hono<{ Bindings: Env }>();

// Mount upload routes
app.route("/", upload);

// Projects API
app.get("/api/projects", async (c) => {
  const db = c.env.DB;
  const { results } = await db.prepare("SELECT * FROM projects ORDER BY created_at DESC").all();
  return c.json(results);
});

app.post("/api/projects", zValidator("json", CreateProjectSchema), async (c) => {
  const db = c.env.DB;
  const data = c.req.valid("json");
  const { results } = await db.prepare(
    "INSERT INTO projects (name, location, status) VALUES (?, ?, ?) RETURNING *"
  ).bind(data.name, data.location || null, data.status).all();
  return c.json(results[0]);
});

// Workers API
app.get("/api/workers", async (c) => {
  const db = c.env.DB;
  const projectId = c.req.query("project_id");
  let query = "SELECT w.*, p.name as project_name FROM workers w LEFT JOIN projects p ON w.project_id = p.id WHERE w.is_active = 1";
  const params = [];
  
  if (projectId) {
    query += " AND w.project_id = ?";
    params.push(projectId);
  }
  
  query += " ORDER BY w.created_at DESC";
  const { results } = await db.prepare(query).bind(...params).all();
  return c.json(results);
});

app.post("/api/workers", zValidator("json", CreateWorkerSchema), async (c) => {
  const db = c.env.DB;
  const data = c.req.valid("json");
  const { results } = await db.prepare(
    "INSERT INTO workers (name, labour_type, phone_number, aadhaar_id, daily_wage, hourly_rate, upi_id, project_id, photo_url, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *"
  ).bind(
    data.name,
    data.labour_type,
    data.phone_number || null,
    data.aadhaar_id || null,
    data.daily_wage,
    data.hourly_rate || null,
    data.upi_id || null,
    data.project_id || null,
    data.photo_url || null,
    data.is_active ?? true
  ).all();
  return c.json(results[0]);
});

app.put("/api/workers/:id", zValidator("json", CreateWorkerSchema), async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const data = c.req.valid("json");
  const { results } = await db.prepare(
    "UPDATE workers SET name = ?, labour_type = ?, phone_number = ?, aadhaar_id = ?, daily_wage = ?, hourly_rate = ?, upi_id = ?, project_id = ?, photo_url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *"
  ).bind(
    data.name,
    data.labour_type,
    data.phone_number || null,
    data.aadhaar_id || null,
    data.daily_wage,
    data.hourly_rate || null,
    data.upi_id || null,
    data.project_id || null,
    data.photo_url || null,
    data.is_active ?? true,
    id
  ).all();
  return c.json(results[0]);
});

// Attendance API
app.get("/api/attendance", async (c) => {
  const db = c.env.DB;
  const date = c.req.query("date") || new Date().toISOString().split('T')[0];
  const projectId = c.req.query("project_id");
  
  let query = `
    SELECT a.*, w.name as worker_name, w.labour_type, p.name as project_name 
    FROM attendance a 
    JOIN workers w ON a.worker_id = w.id 
    JOIN projects p ON a.project_id = p.id 
    WHERE a.attendance_date = ?
  `;
  const params = [date];
  
  if (projectId) {
    query += " AND a.project_id = ?";
    params.push(projectId);
  }
  
  query += " ORDER BY w.name";
  const { results } = await db.prepare(query).bind(...params).all();
  return c.json(results);
});

app.post("/api/attendance", zValidator("json", CreateAttendanceSchema), async (c) => {
  const db = c.env.DB;
  const data = c.req.valid("json");
  
  // Check if attendance already exists for this worker on this date
  const existing = await db.prepare(
    "SELECT id FROM attendance WHERE worker_id = ? AND attendance_date = ?"
  ).bind(data.worker_id, data.attendance_date).first();
  
  if (existing) {
    // Update existing attendance
    const { results } = await db.prepare(
      "UPDATE attendance SET status = ?, hours_worked = ?, latitude = ?, longitude = ?, location_name = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE worker_id = ? AND attendance_date = ? RETURNING *"
    ).bind(data.status, data.hours_worked || null, data.latitude || null, data.longitude || null, data.location_name || null, data.notes || null, data.worker_id, data.attendance_date).all();
    return c.json(results[0]);
  } else {
    // Create new attendance
    const { results } = await db.prepare(
      "INSERT INTO attendance (worker_id, project_id, attendance_date, status, hours_worked, latitude, longitude, location_name, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *"
    ).bind(
      data.worker_id,
      data.project_id,
      data.attendance_date,
      data.status,
      data.hours_worked || null,
      data.latitude || null,
      data.longitude || null,
      data.location_name || null,
      data.notes || null
    ).all();
    return c.json(results[0]);
  }
});

// Payments API
app.get("/api/payments", async (c) => {
  const db = c.env.DB;
  const workerId = c.req.query("worker_id");
  const projectId = c.req.query("project_id");
  const status = c.req.query("status");
  
  let query = `
    SELECT p.*, w.name as worker_name, pr.name as project_name 
    FROM payments p 
    JOIN workers w ON p.worker_id = w.id 
    JOIN projects pr ON p.project_id = pr.id 
    WHERE 1=1
  `;
  const params = [];
  
  if (workerId) {
    query += " AND p.worker_id = ?";
    params.push(workerId);
  }
  
  if (projectId) {
    query += " AND p.project_id = ?";
    params.push(projectId);
  }
  
  if (status) {
    query += " AND p.status = ?";
    params.push(status);
  }
  
  query += " ORDER BY p.payment_date DESC";
  const { results } = await db.prepare(query).bind(...params).all();
  return c.json(results);
});

app.post("/api/payments", zValidator("json", CreatePaymentSchema), async (c) => {
  const db = c.env.DB;
  const data = c.req.valid("json");
  const { results } = await db.prepare(
    "INSERT INTO payments (worker_id, project_id, payment_date, amount, payment_type, payment_period_start, payment_period_end, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *"
  ).bind(
    data.worker_id,
    data.project_id,
    data.payment_date,
    data.amount,
    data.payment_type,
    data.payment_period_start || null,
    data.payment_period_end || null,
    data.status || 'unpaid',
    data.notes || null
  ).all();
  return c.json(results[0]);
});

app.put("/api/payments/:id", zValidator("json", CreatePaymentSchema), async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const data = c.req.valid("json");
  const { results } = await db.prepare(
    "UPDATE payments SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *"
  ).bind(data.status, data.notes || null, id).all();
  return c.json(results[0]);
});

// Dashboard stats API
app.get("/api/dashboard", async (c) => {
  const db = c.env.DB;
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  
  const [totalWorkers, activeWorkers, todayAttendance, pendingPayments, thisMonthWages] = await Promise.all([
    db.prepare("SELECT COUNT(*) as count FROM workers WHERE is_active = 1").first(),
    db.prepare("SELECT COUNT(*) as count FROM workers WHERE is_active = 1").first(),
    db.prepare("SELECT COUNT(*) as count FROM attendance WHERE attendance_date = ? AND status != 'absent'").bind(today).first(),
    db.prepare("SELECT COUNT(*) as count FROM payments WHERE status = 'unpaid'").first(),
    db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_date LIKE ? || '%' AND payment_type = 'wage'").bind(thisMonth).first()
  ]);
  
  const stats = {
    totalWorkers: totalWorkers?.count || 0,
    activeWorkers: activeWorkers?.count || 0,
    todayAttendance: todayAttendance?.count || 0,
    pendingPayments: pendingPayments?.count || 0,
    thisMonthWages: thisMonthWages?.total || 0,
  };
  
  return c.json(stats);
});

// Calculate wages for a worker for a period
app.get("/api/calculate-wages", async (c) => {
  const db = c.env.DB;
  const workerId = c.req.query("worker_id");
  const startDate = c.req.query("start_date");
  const endDate = c.req.query("end_date");
  
  if (!workerId || !startDate || !endDate) {
    return c.json({ error: "worker_id, start_date, and end_date are required" }, 400);
  }
  
  // Get worker details
  const worker = await db.prepare("SELECT * FROM workers WHERE id = ?").bind(workerId).first();
  if (!worker) {
    return c.json({ error: "Worker not found" }, 404);
  }
  
  // Get attendance for the period
  const { results: attendance } = await db.prepare(
    "SELECT * FROM attendance WHERE worker_id = ? AND attendance_date >= ? AND attendance_date <= ?"
  ).bind(workerId, startDate, endDate).all();
  
  let totalWages = 0;
  let fullDays = 0;
  let halfDays = 0;
  
  attendance.forEach((record: any) => {
    if (record.status === 'full') {
      totalWages += (worker as any).daily_wage;
      fullDays++;
    } else if (record.status === 'half') {
      totalWages += (worker as any).daily_wage * 0.5;
      halfDays++;
    }
  });
  
  return c.json({
    workerId: (worker as any).id,
    workerName: (worker as any).name,
    dailyWage: (worker as any).daily_wage,
    fullDays,
    halfDays,
    totalDays: fullDays + halfDays,
    totalWages,
    startDate,
    endDate
  });
});

export default app;
