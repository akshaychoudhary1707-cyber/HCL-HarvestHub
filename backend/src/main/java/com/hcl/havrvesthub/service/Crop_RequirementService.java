package com.hcl.havrvesthub.service;

import com.hcl.havrvesthub.model.Crop_Requirements;
import com.hcl.havrvesthub.repo.Crop_RequirementRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class Crop_RequirementService {
    @Autowired
    Crop_RequirementRepo cr;

    public void addRequirements(Crop_Requirements req){
        cr.save(req);
    }

    public List<Crop_Requirements> findAll(){
        return cr.findAll();
    }

    public Optional<Crop_Requirements> findById(int id) {
        return cr.findById(id);
    }

    public void delete(){
        cr.deleteAll();
    }
}
