package com.hcl.havrvesthub.controller;

import com.hcl.havrvesthub.model.Crops;
import com.hcl.havrvesthub.service.CropsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/Crops")
@CrossOrigin(origins = "http://localhost:4200")
public class CropsController {
    @Autowired
    CropsService c;

    @PostMapping
    public void saveCrops(@RequestBody Crops crops){
        c.addCrop(crops);
    }

    @GetMapping("/all")
    public List<Crops> getCrops(){
        return c.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Crops> findById(@PathVariable int id){
        return c.findById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteCropById(@PathVariable int id){
        c.deleteById(id);
    }

    @DeleteMapping("/all")
    public void deleteCrops(){
        c.delete();
    }
}
