/**
 * HarvestHub Crop Model
 * Matches backend Crops entity (id, crop_name, crop_season, crop_type, growing_days)
 *
 * Data Access Rule:
 * Crops are preloaded globally and shared by all users (never filtered by login_id).
 */

export interface Crop {
  id?: number;
  crop_id?: number; // Compatibility alias
  crop_name: string;
  crop_season: string; // e.g. Kharif, Rabi, Zaid / Summer, Whole Year
  crop_type: string;   // e.g. Cereal, Pulse, Cash Crop, Vegetable, Oilseed
  growing_days: number;
}

