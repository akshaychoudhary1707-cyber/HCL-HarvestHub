import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { CropRequirement, CropRequirementRequest } from '../models/crop-requirement.model';

@Injectable({
  providedIn: 'root'
})
export class CropRequirementsService {
  private http = inject(HttpClient);

  // Spring Boot Crop_Requirements controller: @RequestMapping("/Crop_Requirements")
  private readonly baseUrl = 'http://localhost:9000/Crop_Requirements';

  /**
   * DATA ACCESS RULE 4:
   * "Crop Requirements data is preloaded in the database.
   * Do NOT filter Crop Requirements by login_id.
   * All users should be able to view all Crop Requirements."
   */
  getAllCropRequirements(): Observable<CropRequirement[]> {
    return this.http.get<CropRequirement[]>(`${this.baseUrl}/all`).pipe(
      map(reqs => {
        if (!reqs || !Array.isArray(reqs)) return [];
        return reqs;
      }),
      catchError(err => {
        console.error('CropRequirementsService getAllCropRequirements error:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Fetches requirement by ID
   */
  getCropRequirementById(id: number): Observable<CropRequirement | null> {
    return this.http.get<CropRequirement>(`${this.baseUrl}/${id}`).pipe(
      catchError(err => {
        console.error(`CropRequirementsService getCropRequirementById ${id} error:`, err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Adds a new Crop Requirement to the global catalog
   */
  addCropRequirement(req: CropRequirementRequest): Observable<void> {
    return this.http.post<void>(this.baseUrl, req).pipe(
      catchError(err => {
        console.error('CropRequirementsService addCropRequirement error:', err);
        return throwError(() => err);
      })
    );
  }
}

