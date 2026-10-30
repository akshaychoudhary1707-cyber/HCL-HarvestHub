package com.hcl.havrvesthub.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Crop_Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int plan_id;

    @ManyToOne
    @JoinColumn(name = "farm_id", nullable = false)
    Farms farm;

    @ManyToOne
    @JoinColumn(name = "crop_id", nullable = false)
    Crops crop;

    @ManyToOne
    @JoinColumn(name = "requirement_id", nullable = true)
    Crop_Requirements requirement;

    String season;
    int expected_yield_kg;
    int growth_duration;
    String water_requirement;
    String soil_requirement;
    String fertilizer_requirement;
}
