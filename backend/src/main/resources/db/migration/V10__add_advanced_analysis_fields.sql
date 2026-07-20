ALTER TABLE analysis_results 
ADD COLUMN ats_friendly BOOLEAN,
ADD COLUMN hard_skills_found TEXT,
ADD COLUMN hard_skills_missing TEXT,
ADD COLUMN soft_skills_found TEXT,
ADD COLUMN soft_skills_missing TEXT,
ADD COLUMN experience_match TEXT,
ADD COLUMN education_match BOOLEAN,
ADD COLUMN keyword_density TEXT,
ADD COLUMN resume_improvements TEXT,
ADD COLUMN cover_letter_points TEXT,
ADD COLUMN interview_questions TEXT,
ADD COLUMN overall_verdict TEXT;
