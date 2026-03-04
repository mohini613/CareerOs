package com.careeros.repository;
import com.careeros.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;


@Repository

public interface SkillRepository extends JpaRepository<Skill, Long> {
Optional<Skill> findByName(String name);
List<Skill> findByCategory(String category);
} 