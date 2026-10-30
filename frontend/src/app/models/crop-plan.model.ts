import { Farm } from './farm.model';
import { Crop } from './crop.model';
import { CropRequirement } from './crop-requirement.model';

export interface CropPlan {
  plan_id?: number;
  farm: Farm;
  crop: Crop;
  requirement?: CropRequirement;
  season: string;
  expected_yield_kg: number;
  growth_duration?: number;
  water_requirement?: string;
  soil_requirement?: string;
  fertilizer_requirement?: string;
}

export interface CropPlanRequest {
  farm: {
    farm_id: number;
  };
  crop?: {
    id: number;
  };
  season?: string;
  expected_yield_kg?: number;
}
