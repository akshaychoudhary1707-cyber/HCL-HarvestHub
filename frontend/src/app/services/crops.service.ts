import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Crop } from '../models/crop.model';

@Injectable({
  providedIn: 'root'
})
export class CropsService {
  private http = inject(HttpClient);

  // Spring Boot Crops controller: @RequestMapping("/Crops")
  private readonly baseUrl = 'http://localhost:9000/Crops';

  /**
   * DATA ACCESS RULE 3:
   * "Crops data is preloaded in the database.
   * Do NOT filter Crops by login_id.
   * All users should be able to view all Crops."
   */
  getAllCrops(): Observable<Crop[]> {
    return this.http.get<Crop[]>(`${this.baseUrl}/all`).pipe(
      map(crops => {
        if (!crops || !Array.isArray(crops)) return [];
        // Map id if crop_id is present
        return crops.map(c => ({
          ...c,
          id: c.id ?? c.crop_id
        }));
      }),
      catchError(err => {
        console.error('CropsService getAllCrops error:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Fetches a single crop by ID
   */
  getCropById(id: number): Observable<Crop | null> {
    return this.http.get<Crop>(`${this.baseUrl}/${id}`).pipe(
      catchError(err => {
        console.error(`CropsService getCropById ${id} error:`, err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Adds a new Crop to the global catalog
   */
  addCrop(crop: Omit<Crop, 'id' | 'crop_id'>): Observable<void> {
    return this.http.post<void>(this.baseUrl, crop).pipe(
      catchError(err => {
        console.error('CropsService addCrop error:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Deletes a crop by ID
   */
  deleteCrop(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(err => {
        console.error(`CropsService deleteCrop ${id} error:`, err);
        return throwError(() => err);
      })
    );
  }
}

