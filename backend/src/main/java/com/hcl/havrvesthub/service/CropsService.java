package com.hcl.havrvesthub.service;

import com.hcl.havrvesthub.model.Crops;
import com.hcl.havrvesthub.repo.CropsRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CropsService {
    @Autowired
    CropsRepo repo;

    public void addCrop(Crops c){
        repo.save(c);
    }

    public void delete(){
        repo.deleteAll();
    }

    public void deleteById(int id){
        repo.deleteById(id);
    }

    public List<Crops> findAll(){
        return repo.findAll();
    }

    public Optional<Crops> findById(int id){
        return repo.findById(id);
    }
}
