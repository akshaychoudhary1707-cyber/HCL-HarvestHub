package com.hcl.havrvesthub.repo;

import com.hcl.havrvesthub.model.Crop_Requirements;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Crop_RequirementRepo extends JpaRepository<Crop_Requirements,Integer> {
}
