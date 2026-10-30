import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Farm } from '../models/farm.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FarmsService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly baseUrl = 'http://localhost:9000/Farms';

  /**
   * Loads user's farms filtered internally by the authenticated user's login_id
   */
  getMyFarms(): Observable<Farm[]> {
    const currentLoginId = this.authService.getLoginId();

    return this.http.get<Farm[]>(`${this.baseUrl}/all`).pipe(
      map(farms => {
        if (!farms || !Array.isArray(farms)) return [];
        return farms.filter(farm => Number(farm.login_id) === Number(currentLoginId));
      }),
      catchError(err => {
        console.error('FarmsService getMyFarms error:', err);
        return throwError(() => err);
      })
    );
  }

  getFarmById(id: number): Observable<Farm | null> {
    const currentLoginId = this.authService.getLoginId();

    return this.http.get<Farm>(`${this.baseUrl}/${id}`).pipe(
      map(farm => {
        if (farm && Number(farm.login_id) === Number(currentLoginId)) {
          return farm;
        }
        return null;
      }),
      catchError(err => {
        console.error(`FarmsService getFarmById ${id} error:`, err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Adds a new Farm with the user's login_id attached internally.
   * Spring Boot automatically matches Crops & Crop Requirements
   * and creates the optimal Crop Plan for this farm.
   */
  addFarm(farmData: Omit<Farm, 'login_id' | 'farm_id'>): Observable<Farm> {
    const currentLoginId = this.authService.getLoginId();

    if (!currentLoginId) {
      return throwError(() => new Error('User is not authenticated.'));
    }

    const newFarm = {
      ...farmData,
      login_id: currentLoginId
    };

    return this.http.post<Farm>(this.baseUrl, newFarm).pipe(
      catchError(err => {
        console.error('FarmsService addFarm error:', err);
        return throwError(() => err);
      })
    );
  }

  deleteFarm(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(err => {
        console.error(`FarmsService deleteFarm ${id} error:`, err);
        return throwError(() => err);
      })
    );
  }
}
