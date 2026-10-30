package com.hcl.havrvesthub.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Crop_Requirements {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int requirement_id;
    @ManyToOne
    @JoinColumn(name = "crop_id", nullable = false)
    private Crops crop;
    String water_requirement;
    String soil_type;
    String sunlight;
    int temperature;
}
