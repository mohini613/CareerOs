package com.careeros.repository;

import com.careeros.model.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long>, JpaSpecificationExecutor<JobApplication> {
    List<JobApplication> findByUserIdOrderByApplicationDateDesc(Long userId);
    Page<JobApplication> findByUserId(Long userId, Pageable pageable);
    Optional<JobApplication> findByIdAndUserId(Long id, Long userId);
}
