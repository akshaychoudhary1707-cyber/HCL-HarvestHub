export * from './auth.model';
export * from './farm.model';
export * from './crop.model';
export * from './crop-requirement.model';
export * from './crop-plan.model';

import { Crop } from './crop.model';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export interface SoilMatchRecommendation {
  crop: Crop;
  compatibilityScore: number;
  matchLevel: 'Optimal' | 'Compatible' | 'Moderate' | 'Not Recommended';
  reason: string;
  estimatedYieldPerAcreKg: number;
}
