import z from "zod";

// Project/Work Site schemas
export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  location: z.string().optional(),
  status: z.enum(['active', 'inactive', 'completed']).default('active'),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional(),
});

export type ProjectType = z.infer<typeof ProjectSchema>;

// Worker/Labour schemas
export const WorkerSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  labour_type: z.string().min(1),
  phone_number: z.string().optional(),
  aadhaar_id: z.string().optional(),
  daily_wage: z.number().positive(),
  hourly_rate: z.number().positive().optional(),
  upi_id: z.string().optional(),
  project_id: z.string().optional(),
  photo_url: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional(),
});

export type WorkerType = z.infer<typeof WorkerSchema> & {
  project_name?: string;
};

export type PaymentType = z.infer<typeof PaymentSchema> & {
  worker_name?: string;
  project_name?: string;
};

// Attendance schemas
export const AttendanceSchema = z.object({
  id: z.string(),
  worker_id: z.string(),
  project_id: z.string(),
  attendance_date: z.string(),
  status: z.enum(['full', 'half', 'absent']),
  hours_worked: z.number().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  location_name: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional(),
});

export type AttendanceType = z.infer<typeof AttendanceSchema>;

// Payment schemas
export const PaymentSchema = z.object({
  id: z.string(),
  worker_id: z.string(),
  project_id: z.string(),
  payment_date: z.string(),
  amount: z.number(),
  payment_type: z.enum(['wage', 'advance', 'bonus', 'deduction']),
  payment_period_start: z.string().optional(),
  payment_period_end: z.string().optional(),
  status: z.enum(['paid', 'unpaid']).default('unpaid'),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional(),
});



// API request/response schemas
export const CreateProjectSchema = ProjectSchema.omit({ id: true, created_at: true, updated_at: true });
export const CreateWorkerSchema = WorkerSchema.omit({ id: true, created_at: true, updated_at: true });
export const CreateAttendanceSchema = AttendanceSchema.omit({ id: true, created_at: true, updated_at: true });
export const CreatePaymentSchema = PaymentSchema.omit({ id: true, created_at: true, updated_at: true });

// Labour types enum
export const LABOUR_TYPES = [
  'Mason',
  'Helper',
  'Electrician',
  'Plumber',
  'Carpenter',
  'Welder',
  'Painter',
  'Driver',
  'Supervisor',
  'General Labour'
] as const;

// Language context
export type Language = 'en' | 'ta';

// Dashboard stats
export const DashboardStatsSchema = z.object({
  totalWorkers: z.number(),
  activeWorkers: z.number(),
  todayAttendance: z.number(),
  pendingPayments: z.number(),
  thisMonthWages: z.number(),
});

export type DashboardStatsType = z.infer<typeof DashboardStatsSchema>;
