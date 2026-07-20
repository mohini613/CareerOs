package com.careeros.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "job_description", columnDefinition = "TEXT", nullable = false)
    private String jobDescription;

    @Column(name = "match_score")
    private Integer matchScore;

    @Column(name = "ats_friendly")
    private Boolean atsFriendly;

    @Column(name = "hard_skills_found", columnDefinition = "TEXT")
    private String hardSkillsFound;

    @Column(name = "hard_skills_missing", columnDefinition = "TEXT")
    private String hardSkillsMissing;

    @Column(name = "soft_skills_found", columnDefinition = "TEXT")
    private String softSkillsFound;

    @Column(name = "soft_skills_missing", columnDefinition = "TEXT")
    private String softSkillsMissing;

    @Column(name = "experience_match", columnDefinition = "TEXT")
    private String experienceMatch;

    @Column(name = "education_match")
    private Boolean educationMatch;

    @Column(name = "keyword_density", columnDefinition = "TEXT")
    private String keywordDensity;

    @Column(name = "resume_improvements", columnDefinition = "TEXT")
    private String resumeImprovements;

    @Column(name = "cover_letter_points", columnDefinition = "TEXT")
    private String coverLetterPoints;

    @Column(name = "interview_questions", columnDefinition = "TEXT")
    private String interviewQuestions;

    @Column(name = "overall_verdict", columnDefinition = "TEXT")
    private String overallVerdict;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String weaknesses;

    @Column(columnDefinition = "TEXT")
    private String suggestions;

    @Column(name = "missing_keywords", columnDefinition = "TEXT")
    private String missingKeywords;

    @Column(name = "full_analysis", columnDefinition = "TEXT")
    private String fullAnalysis;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}