package com.hcl.havrvesthub.controller;

import com.hcl.havrvesthub.model.Login;
import com.hcl.havrvesthub.service.LoginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/Login")
@CrossOrigin(origins = "http://localhost:4200")
public class LoginController {

    @Autowired
    LoginService c;

    @PostMapping
    public void saveLogin(@RequestBody Login login) {
        c.addLogin(login);
    }

    @GetMapping("/all")
    public List<Login> getLogin() {
        return c.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Login> findById(@PathVariable int id) {
        return c.findById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteLoginById(@PathVariable int id) {
        c.deleteById(id);
    }

    @DeleteMapping("/all")
    public void deleteLogin() {
        c.delete();
    }
}