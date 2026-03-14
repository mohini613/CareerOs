package com.careeros.repository;

import com.careeros.model.CareerGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareerGoalRepository extends JpaRepository<CareerGoal, Long> {
    List<CareerGoal> findByUserId(Long userId);
    List<CareerGoal> findByUserIdAndStatus(Long userId, String status);
    List<CareerGoal> findByUserIdOrderByCreatedAtDesc(Long userId);
}
