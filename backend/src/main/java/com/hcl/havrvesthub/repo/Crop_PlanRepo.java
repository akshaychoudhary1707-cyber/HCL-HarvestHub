package com.hcl.havrvesthub.repo;

import com.hcl.havrvesthub.model.Crop_Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Crop_PlanRepo extends JpaRepository<Crop_Plan, Integer> {
}
