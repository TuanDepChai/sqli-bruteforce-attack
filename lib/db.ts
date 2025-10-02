import Database from "better-sqlite3"
import path from "path"

let db: Database.Database | null = null

export function getDatabase() {
  if (!db) {
    const dbPath = path.join(process.cwd(), "vulnerable.db")
    db = new Database(dbPath)

    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT,
        full_name TEXT,
        phone TEXT,
        department TEXT,
        position TEXT,
        role TEXT DEFAULT 'user',
        account_status TEXT DEFAULT 'active',
        last_login DATETIME,
        failed_login_attempts INTEGER DEFAULT 0,
        account_locked BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        password_changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        two_factor_enabled BOOLEAN DEFAULT 0,
        security_question TEXT,
        security_answer TEXT
      );

      CREATE TABLE IF NOT EXISTS attack_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        username_attempt TEXT,
        password_attempt TEXT,
        attack_type TEXT,
        sql_query TEXT,
        success BOOLEAN,
        error_message TEXT,
        user_agent TEXT,
        request_method TEXT,
        request_headers TEXT,
        geo_location TEXT,
        device_fingerprint TEXT,
        session_id TEXT,
        referer TEXT,
        response_time_ms INTEGER,
        payload_size INTEGER,
        additional_data TEXT
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT UNIQUE NOT NULL,
        user_id INTEGER,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS failed_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        ip_address TEXT,
        attempt_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        reason TEXT
      );

      CREATE TABLE IF NOT EXISTS security_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT,
        severity TEXT,
        description TEXT,
        ip_address TEXT,
        user_id INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      -- Insert enhanced default users if not exists
      INSERT OR IGNORE INTO users (
        id, username, password, email, full_name, phone, 
        department, position, role, account_status
      ) VALUES
        (1, 'admin', 'admin123', 'admin@company.com', 'Administrator', '+1-555-0001', 'IT', 'System Administrator', 'admin', 'active'),
        (2, 'user', 'password', 'user@company.com', 'John User', '+1-555-0002', 'Sales', 'Sales Representative', 'user', 'active'),
        (3, 'john', 'john2024', 'john@company.com', 'John Doe', '+1-555-0003', 'Engineering', 'Software Engineer', 'user', 'active'),
        (4, 'sarah', 'sarah!pass', 'sarah@company.com', 'Sarah Smith', '+1-555-0004', 'Marketing', 'Marketing Manager', 'user', 'active'),
        (5, 'mike', 'mike123', 'mike@company.com', 'Mike Johnson', '+1-555-0005', 'Finance', 'Financial Analyst', 'user', 'active'),
        (6, 'emma', 'emma2024', 'emma@company.com', 'Emma Wilson', '+1-555-0006', 'HR', 'HR Manager', 'user', 'active');

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_attack_logs_timestamp ON attack_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_attack_logs_ip ON attack_logs(ip_address);
      CREATE INDEX IF NOT EXISTS idx_attack_logs_type ON attack_logs(attack_type);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_failed_attempts_username ON failed_attempts(username);
      CREATE INDEX IF NOT EXISTS idx_failed_attempts_ip ON failed_attempts(ip_address);
    `)
  }
  return db
}

export function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}
