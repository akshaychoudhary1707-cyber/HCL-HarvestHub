package com.hcl.havrvesthub.repo;
import com.hcl.havrvesthub.model.Crops;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CropsRepo extends JpaRepository<Crops,Integer> {
}
