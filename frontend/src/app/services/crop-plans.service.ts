import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, throwError } from 'rxjs';
import { CropPlan, CropPlanRequest } from '../models/crop-plan.model';
import { FarmsService } from './farms.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CropPlansService {
  private http = inject(HttpClient);
  private farmsService = inject(FarmsService);
  private authService = inject(AuthService);

  private readonly baseUrl = 'http://localhost:9000/Crop_Plans';

  /**
   * Retrieves crop plans belonging internally to the user's farms
   */
  getMyCropPlans(): Observable<CropPlan[]> {
    const currentLoginId = this.authService.getLoginId();

    return forkJoin({
      userFarms: this.farmsService.getMyFarms(),
      allPlans: this.http.get<CropPlan[]>(`${this.baseUrl}/all`).pipe(
        catchError(() => this.http.get<CropPlan[]>('http://localhost:9000/crop-plans/all')),
        catchError(err => {
          console.error('CropPlansService allPlans error:', err);
          return throwError(() => err);
        })
      )
    }).pipe(
      map(({ userFarms, allPlans }) => {
        if (!allPlans || !Array.isArray(allPlans)) return [];

        const userFarmIdSet = new Set(
          userFarms
            .map(f => f.farm_id)
            .filter((id): id is number => id !== undefined && id !== null)
        );

        return allPlans.filter(plan => {
          if (!plan.farm) return false;

          const farmLoginIdMatch =
            currentLoginId !== null &&
            plan.farm.login_id !== undefined &&
            Number(plan.farm.login_id) === Number(currentLoginId);

          const farmIdMatch =
            plan.farm.farm_id !== undefined &&
            userFarmIdSet.has(Number(plan.farm.farm_id));

          return farmLoginIdMatch || farmIdMatch;
        });
      }),
      catchError(err => {
        console.error('CropPlansService getMyCropPlans error:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Triggers the Spring Boot crop plan recommendation engine for a specific farm
   */
  generatePlanForFarm(farmId: number): Observable<CropPlan> {
    return this.http.post<CropPlan>(`${this.baseUrl}/generate/${farmId}`, {}).pipe(
      catchError(() => this.http.post<CropPlan>(`http://localhost:9000/crop-plans/generate/${farmId}`, {})),
      catchError(err => {
        console.error('CropPlansService generatePlanForFarm error:', err);
        return throwError(() => err);
      })
    );
  }

  deleteCropPlan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(() => this.http.delete<void>(`http://localhost:9000/crop-plans/${id}`)),
      catchError(err => {
        console.error(`CropPlansService deleteCropPlan ${id} error:`, err);
        return throwError(() => err);
      })
    );
  }
}
