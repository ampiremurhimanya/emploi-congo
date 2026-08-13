const pool = require('./db');

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database tables...');

    // Users table (students, companies, admin)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'COMPANY', 'ADMIN')),
        
        -- Student fields
        field_of_study VARCHAR(255),
        degree_program VARCHAR(255),
        cv_file_name VARCHAR(255),
        cv_original_name VARCHAR(255),
        
        -- Company fields
        company_name VARCHAR(255),
        company_website VARCHAR(255),
        company_description TEXT,
        verified_company BOOLEAN DEFAULT FALSE,
        
        -- Status
        account_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ users table ready');

    // Opportunities table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS opportunities (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        company_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        field VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        employment_type VARCHAR(100),
        salary_range VARCHAR(255),
        application_deadline DATE,
        status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED','CLOSED')),
        internal_post BOOLEAN DEFAULT FALSE,
        verified_company BOOLEAN DEFAULT FALSE,
        rejection_reason TEXT,
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ opportunities table ready');

    // Applications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
        status VARCHAR(30) DEFAULT 'SUBMITTED' CHECK (status IN (
          'SUBMITTED','UNDER_REVIEW','INTERVIEWING','APPROVED','REJECTED','POSITION_FILLED'
        )),
        cover_note TEXT,
        cv_file_snapshot VARCHAR(255),
        company_feedback TEXT,
        current_step INTEGER DEFAULT 1,
        total_steps INTEGER DEFAULT 4,
        applied_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(student_id, opportunity_id)
      );
    `);
    console.log('✅ applications table ready');

    // Saved opportunities table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS saved_opportunities (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
        saved_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(student_id, opportunity_id)
      );
    `);
    console.log('✅ saved_opportunities table ready');

    console.log('');
    console.log('🎉 All tables created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
    process.exit(1);
  }
}

setupDatabase();