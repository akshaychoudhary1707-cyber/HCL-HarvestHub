package com.hcl.havrvesthub.repo;

import com.hcl.havrvesthub.model.Farms;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FarmsRepo extends JpaRepository<Farms,Integer> {
}
