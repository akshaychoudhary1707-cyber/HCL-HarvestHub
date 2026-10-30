package com.hcl.havrvesthub.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Farms {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int farm_id;
    String farm_name;
    String farm_location;
    float area;
    String soil_type;
    String season;
    int login_id;
}
