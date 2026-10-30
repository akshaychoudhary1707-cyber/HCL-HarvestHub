package com.hcl.havrvesthub.service;

import com.hcl.havrvesthub.model.Crop_Plan;
import com.hcl.havrvesthub.model.Crop_Requirements;
import com.hcl.havrvesthub.model.Crops;
import com.hcl.havrvesthub.model.Farms;
import com.hcl.havrvesthub.repo.Crop_PlanRepo;
import com.hcl.havrvesthub.repo.Crop_RequirementRepo;
import com.hcl.havrvesthub.repo.CropsRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class Crop_PlanService {

    @Autowired
    Crop_PlanRepo cp;

    @Autowired
    CropsRepo cropsRepo;

    @Autowired
    Crop_RequirementRepo reqRepo;

    public void addCropPlan(Crop_Plan plan) {
        cp.save(plan);
    }

    public List<Crop_Plan> findAll() {
        return cp.findAll();
    }

    public Optional<Crop_Plan> findById(int id) {
        return cp.findById(id);
    }

    public void delete(int id) {
        cp.deleteById(id);
    }

    /**
     * Automatic Crop Plan Generation Engine:
     * 1. Searches Crops and Crop Requirements tables.
     * 2. Evaluates farm's Soil Type, Location, Season, and Climate suitability.
     * 3. Finds the optimal matching Crop and joined Crop Requirements.
     * 4. Calculates Expected Yield, Growth Duration, Fertilizer Requirement, Water & Soil needs.
     * 5. Automatically persists and returns the best Crop Plan.
     */
    public Crop_Plan generateBestCropPlan(Farms farm) {
        List<Crops> allCrops = cropsRepo.findAll();
        List<Crop_Requirements> allRequirements = reqRepo.findAll();

        if (allCrops.isEmpty()) {
            return null;
        }

        Crops bestCrop = null;
        Crop_Requirements bestReq = null;
        int highestScore = -1;

        String farmSoil = normalize(farm.getSoil_type());
        String farmSeason = normalize(farm.getSeason());
        String farmLocation = normalize(farm.getFarm_location());

        // Evaluate each Crop Requirement (which joins Crop with soil, water, climate)
        if (!allRequirements.isEmpty()) {
            for (Crop_Requirements req : allRequirements) {
                Crops crop = req.getCrop();
                if (crop == null) continue;

                int score = calculateMatchScore(crop, req, farmSoil, farmSeason, farmLocation);
                if (score > highestScore) {
                    highestScore = score;
                    bestCrop = crop;
                    bestReq = req;
                }
            }
        }

        // Fallback: If no requirement matched or table empty, score against crops list
        if (bestCrop == null) {
            for (Crops crop : allCrops) {
                int score = 0;
                String cropSeason = normalize(crop.getCrop_season());
                if (!farmSeason.isEmpty() && (cropSeason.contains(farmSeason) || farmSeason.contains(cropSeason))) {
                    score += 50;
                }
                if (score > highestScore) {
                    highestScore = score;
                    bestCrop = crop;
                }
            }
        }

        if (bestCrop == null) {
            bestCrop = allCrops.get(0);
        }

        // Build the generated Crop Plan with joined agronomic data
        Crop_Plan plan = new Crop_Plan();
        plan.setFarm(farm);
        plan.setCrop(bestCrop);
        plan.setRequirement(bestReq);

        String activeSeason = (farm.getSeason() != null && !farm.getSeason().trim().isEmpty())
                ? farm.getSeason()
                : (bestCrop.getCrop_season() != null ? bestCrop.getCrop_season() : "Kharif");
        plan.setSeason(activeSeason);

        // Calculate expected yield based on acreage and crop productivity
        int yieldMultiplier = getBaseYieldPerAcre(bestCrop.getCrop_name(), bestCrop.getCrop_type());
        float area = farm.getArea() > 0 ? farm.getArea() : 1.0f;
        int expectedYield = Math.round(area * yieldMultiplier);
        plan.setExpected_yield_kg(expectedYield);

        // Set joined agronomic parameters
        int duration = bestCrop.getGrowing_days() > 0 ? bestCrop.getGrowing_days() : 120;
        plan.setGrowth_duration(duration);

        String waterRequirement = (bestReq != null && bestReq.getWater_requirement() != null)
                ? bestReq.getWater_requirement()
                : determineDefaultWater(bestCrop.getCrop_name(), bestCrop.getCrop_type());
        plan.setWater_requirement(waterRequirement);

        String soilRequirement = (bestReq != null && bestReq.getSoil_type() != null)
                ? bestReq.getSoil_type()
                : (farm.getSoil_type() != null ? farm.getSoil_type() : "Loamy Soil");
        plan.setSoil_requirement(soilRequirement);

        String fertilizerRequirement = determineFertilizerRecommendation(bestCrop.getCrop_name(), bestCrop.getCrop_type());
        plan.setFertilizer_requirement(fertilizerRequirement);

        // Save generated plan to database
        cp.save(plan);
        return plan;
    }

    private int calculateMatchScore(Crops crop, Crop_Requirements req, String farmSoil, String farmSeason, String farmLocation) {
        int score = 0;

        String reqSoil = normalize(req.getSoil_type());
        String cropSeason = normalize(crop.getCrop_season());
        String cropName = normalize(crop.getCrop_name());

        // 1. Soil Match (Weight: 45)
        if (!farmSoil.isEmpty() && !reqSoil.isEmpty()) {
            if (reqSoil.contains(farmSoil) || farmSoil.contains(reqSoil)) {
                score += 45;
            } else if (hasPartialSoilCompatibility(farmSoil, reqSoil, cropName)) {
                score += 30;
            }
        }

        // 2. Season Match (Weight: 35)
        if (!farmSeason.isEmpty() && !cropSeason.isEmpty()) {
            if (cropSeason.contains(farmSeason) || farmSeason.contains(cropSeason)) {
                score += 35;
            } else if (cropSeason.contains("whole") || cropSeason.contains("year") || cropSeason.contains("all")) {
                score += 25;
            }
        } else {
            score += 15;
        }

        // 3. Location & Regional Suitability (Weight: 20)
        if (!farmLocation.isEmpty()) {
            if (isRegionSuitable(farmLocation, cropName)) {
                score += 20;
            } else {
                score += 10;
            }
        }

        return score;
    }

    private boolean hasPartialSoilCompatibility(String farmSoil, String reqSoil, String cropName) {
        if (farmSoil.contains("loam") || reqSoil.contains("loam")) return true;
        if (farmSoil.contains("black") && (cropName.contains("cotton") || cropName.contains("soybean") || cropName.contains("wheat"))) return true;
        if (farmSoil.contains("alluvial") && (cropName.contains("rice") || cropName.contains("wheat") || cropName.contains("maize"))) return true;
        if (farmSoil.contains("clay") && (cropName.contains("rice") || cropName.contains("paddy"))) return true;
        if (farmSoil.contains("sandy") && (cropName.contains("groundnut") || cropName.contains("potato") || cropName.contains("bajra"))) return true;
        return false;
    }

    private boolean isRegionSuitable(String location, String cropName) {
        if ((location.contains("punjab") || location.contains("haryana") || location.contains("up") || location.contains("uttar"))
                && (cropName.contains("wheat") || cropName.contains("rice") || cropName.contains("sugarcane") || cropName.contains("mustard"))) {
            return true;
        }
        if ((location.contains("maharashtra") || location.contains("gujarat") || location.contains("mp") || location.contains("madhya"))
                && (cropName.contains("cotton") || cropName.contains("soybean") || cropName.contains("groundnut") || cropName.contains("jowar"))) {
            return true;
        }
        if ((location.contains("karnataka") || location.contains("andhra") || location.contains("tamil") || location.contains("kerala"))
                && (cropName.contains("rice") || cropName.contains("maize") || cropName.contains("ragi") || cropName.contains("pulses"))) {
            return true;
        }
        if ((location.contains("rajasthan") || location.contains("arid"))
                && (cropName.contains("bajra") || cropName.contains("millet") || cropName.contains("mustard") || cropName.contains("gram"))) {
            return true;
        }
        return false;
    }

    private int getBaseYieldPerAcre(String cropName, String cropType) {
        String name = normalize(cropName);
        String type = normalize(cropType);

        if (name.contains("sugarcane")) return 32000;
        if (name.contains("potato")) return 11000;
        if (name.contains("tomato")) return 14500;
        if (name.contains("maize") || name.contains("corn")) return 2400;
        if (name.contains("rice") || name.contains("paddy")) return 2100;
        if (name.contains("wheat")) return 1850;
        if (name.contains("cotton")) return 980;
        if (name.contains("soybean")) return 1250;
        if (name.contains("groundnut")) return 1300;
        if (name.contains("mustard")) return 850;
        if (type.contains("vegetable")) return 8000;
        if (type.contains("pulse")) return 750;
        return 1600;
    }

    private String determineDefaultWater(String cropName, String cropType) {
        String name = normalize(cropName);
        if (name.contains("rice") || name.contains("paddy") || name.contains("sugarcane")) return "Very High";
        if (name.contains("wheat") || name.contains("corn") || name.contains("maize")) return "Moderate";
        if (name.contains("millet") || name.contains("bajra") || name.contains("gram")) return "Low";
        return "Moderate";
    }

    private String determineFertilizerRecommendation(String cropName, String cropType) {
        String name = normalize(cropName);
        String type = normalize(cropType);

        if (type.contains("cereal") || name.contains("rice") || name.contains("wheat") || name.contains("maize")) {
            return "NPK 120:60:40 kg/ha with Zinc Sulfate (25 kg/ha) at basal stage";
        } else if (type.contains("pulse") || name.contains("gram") || name.contains("moong") || name.contains("dal")) {
            return "NPK 20:40:20 kg/ha with Rhizobium Bio-fertilizer seed treatment";
        } else if (name.contains("cotton") || name.contains("sugarcane") || type.contains("cash")) {
            return "NPK 150:75:75 kg/ha with 10 tonnes Farmyard Manure & Boron";
        } else if (type.contains("oilseed") || name.contains("mustard") || name.contains("soybean") || name.contains("groundnut")) {
            return "NPK 60:40:20 kg/ha with Gypsum/Sulfur (200 kg/ha) for oil content";
        } else if (type.contains("vegetable") || name.contains("potato") || name.contains("tomato")) {
            return "NPK 180:80:100 kg/ha with enriched Vermicompost (5 tonnes/ha)";
        }
        return "Balanced NPK 100:50:50 kg/ha with Organic Compost";
    }

    private String normalize(String str) {
        return (str == null) ? "" : str.trim().toLowerCase();
    }
}
