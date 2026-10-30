import { Crop } from './crop.model';

/**
 * HarvestHub Crop Requirement Model
 * Matches backend Crop_Requirements entity (requirement_id, crop, water_requirement, soil_type, sunlight, temperature)
 *
 * Data Access Rule:
 * Crop Requirements are preloaded globally and accessible to all users (never filtered by login_id).
 */

export interface CropRequirement {
  requirement_id?: number;
  crop: Crop;
  water_requirement: string; // e.g. High, Moderate, Low, Very High
  soil_type: string;         // e.g. Loamy, Alluvial, Black Cotton, Clayey, Sandy
  sunlight: string;          // e.g. Full Sun, Partial Shade
  temperature: number;       // in Celsius
}

export interface CropRequirementRequest {
  crop: { id: number };
  water_requirement: string;
  soil_type: string;
  sunlight: string;
  temperature: number;
}

