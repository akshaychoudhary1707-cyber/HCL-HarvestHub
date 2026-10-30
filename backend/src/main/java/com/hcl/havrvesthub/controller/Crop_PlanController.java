package com.hcl.havrvesthub.controller;

import com.hcl.havrvesthub.model.Crop_Plan;
import com.hcl.havrvesthub.model.Farms;
import com.hcl.havrvesthub.repo.FarmsRepo;
import com.hcl.havrvesthub.service.Crop_PlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping({"/Crop_Plans", "/crop-plans"})
@CrossOrigin(origins = "http://localhost:4200")
public class Crop_PlanController {

    @Autowired
    Crop_PlanService cropPlanService;

    @Autowired
    FarmsRepo farmsRepo;

    @PostMapping
    public void saveCropPlan(@RequestBody Crop_Plan cropPlan) {
        cropPlanService.addCropPlan(cropPlan);
    }

    @PostMapping("/generate/{farmId}")
    public Crop_Plan generateCropPlanForFarm(@PathVariable int farmId) {
        Optional<Farms> farm = farmsRepo.findById(farmId);
        if (farm.isPresent()) {
            return cropPlanService.generateBestCropPlan(farm.get());
        }
        return null;
    }

    @GetMapping("/all")
    public List<Crop_Plan> getAllCropPlans() {
        return cropPlanService.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Crop_Plan> getCropPlanById(@PathVariable int id) {
        return cropPlanService.findById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteCropPlan(@PathVariable int id) {
        cropPlanService.delete(id);
    }
}
