package com.hcl.havrvesthub.service;

import com.hcl.havrvesthub.model.Farms;
import com.hcl.havrvesthub.repo.FarmsRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FarmsService {

    @Autowired
    FarmsRepo repo;

    @Autowired
    Crop_PlanService cropPlanService;

    /**
     * Adds a new Farm and automatically triggers the crop plan recommendation engine
     * to generate and save the best seasonal crop plan for this farm.
     */
    public Farms addFarm(Farms farm) {
        Farms savedFarm = repo.save(farm);
        try {
            cropPlanService.generateBestCropPlan(savedFarm);
        } catch (Exception e) {
            System.err.println("Warning: Automatic crop plan generation failed: " + e.getMessage());
        }
        return savedFarm;
    }

    public List<Farms> findAll() {
        return repo.findAll();
    }

    public Optional<Farms> findById(int id) {
        return repo.findById(id);
    }

    public void delete(int id) {
        repo.deleteById(id);
    }
}
