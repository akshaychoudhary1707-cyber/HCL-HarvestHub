package com.hcl.havrvesthub.service;

import com.hcl.havrvesthub.model.Login;
import com.hcl.havrvesthub.repo.LoginRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LoginService {
    @Autowired
    LoginRepo repo;

    public void addLogin(Login c){
        repo.save(c);
    }
    public void delete(){
        repo.deleteAll();
    }
    public void deleteById(int id){
        repo.deleteById(id);
    }
    public List<Login> findAll(){
        return repo.findAll();
    }
    public Optional<Login> findById(int id){
        return repo.findById(id);
    }
}
