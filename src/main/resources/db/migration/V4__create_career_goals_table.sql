CREATE TABLE career_goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL, -- Role_Change, Skill_Development, Promotion, Industry_Switch
    target_role VARCHAR(200),
    target_company VARCHAR(200),
    target_industry VARCHAR(100),
    target_salary_min DECIMAL(12,2),
    target_salary_max DECIMAL(12,2),
    target_date DATE,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, abandoned
    progress_percentage INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_career_goals_user_id ON career_goals(user_id);
CREATE INDEX idx_career_goals_status ON career_goals(status);