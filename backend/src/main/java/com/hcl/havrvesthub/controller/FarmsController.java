package com.hcl.havrvesthub.controller;

import com.hcl.havrvesthub.model.Farms;
import com.hcl.havrvesthub.service.FarmsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/Farms")
@CrossOrigin(origins = "http://localhost:4200")
public class FarmsController {

    @Autowired
    FarmsService f;

    @PostMapping
    public Farms saveFarm(@RequestBody Farms farms) {
        return f.addFarm(farms);
    }

    @GetMapping("/all")
    public List<Farms> getFarm() {
        return f.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Farms> findById(@PathVariable int id) {
        return f.findById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        f.delete(id);
    }
}
