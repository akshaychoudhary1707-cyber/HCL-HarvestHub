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
public class Crops {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;
    String crop_name;
    String crop_season;
    String crop_type;
    int growing_days;
}
