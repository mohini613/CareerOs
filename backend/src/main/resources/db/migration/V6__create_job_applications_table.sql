CREATE TABLE job_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    job_title VARCHAR(200) NOT NULL,
    job_url VARCHAR(500),
    application_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'applied', -- applied, screening, interview, offer, rejected, accepted, withdrawn
    salary_range VARCHAR(100),
    location VARCHAR(200),
    job_type VARCHAR(50), -- Full-time, Part-time, Contract, Remote
    notes TEXT,
    interview_date TIMESTAMP,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_applications_status ON job_applications(status);
CREATE INDEX idx_applications_date ON job_applications(application_date);