package com.careeros.repository;

import com.careeros.model.JobApplication;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class JobApplicationSpecification {

    public static Specification<JobApplication> hasUserId(Long userId) {
        return (root, query, cb) -> cb.equal(root.get("user").get("id"), userId);
    }

    public static Specification<JobApplication> hasStatus(String status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<JobApplication> hasCompany(String company) {
        return (root, query, cb) -> company == null ? null : cb.like(cb.lower(root.get("companyName")), "%" + company.toLowerCase() + "%");
    }

    public static Specification<JobApplication> appliedAfter(LocalDate date) {
        return (root, query, cb) -> date == null ? null : cb.greaterThanOrEqualTo(root.get("applicationDate"), date);
    }
}
