export interface Farm {
  farm_id?: number;
  farm_name: string;
  farm_location: string;
  area: number; // in Acres
  soil_type: string;
  season?: string; // e.g. Kharif, Rabi, Zaid, Summer, Whole Year
  login_id: number;
}
