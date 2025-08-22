
-- Projects/Work Sites table
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Labour profiles table
CREATE TABLE workers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  labour_type TEXT NOT NULL,
  phone_number TEXT,
  aadhaar_id TEXT,
  daily_wage REAL NOT NULL,
  hourly_rate REAL,
  upi_id TEXT,
  project_id INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance tracking table
CREATE TABLE attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL, -- 'full', 'half', 'absent'
  hours_worked REAL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  payment_date DATE NOT NULL,
  amount REAL NOT NULL,
  payment_type TEXT NOT NULL, -- 'wage', 'advance', 'bonus', 'deduction'
  payment_period_start DATE,
  payment_period_end DATE,
  status TEXT DEFAULT 'unpaid', -- 'paid', 'unpaid'
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
