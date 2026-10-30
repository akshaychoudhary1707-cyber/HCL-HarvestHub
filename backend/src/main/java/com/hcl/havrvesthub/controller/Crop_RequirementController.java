package com.hcl.havrvesthub.controller;


import com.hcl.havrvesthub.model.Crop_Requirements;
import com.hcl.havrvesthub.service.Crop_RequirementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/Crop_Requirements")
@CrossOrigin(origins = "http://localhost:4200")
public class Crop_RequirementController {
    @Autowired
    Crop_RequirementService cr;

    @PostMapping
    public void saveCrops(@RequestBody Crop_Requirements requirement){
        cr.addRequirements(requirement);
    }

    @GetMapping("/all")
    public List<Crop_Requirements> getCrops(){
        return cr.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Crop_Requirements> findById(@PathVariable int id){
        return cr.findById(id);
    }

    @DeleteMapping("/all")
    public void deleteCrops(){
        cr.delete();
    }
}
