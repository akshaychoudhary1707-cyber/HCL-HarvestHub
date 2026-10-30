import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CropRequirementsService } from '../../services/crop-requirements.service';
import { CropsService } from '../../services/crops.service';
import { CropRequirement, CropRequirementRequest } from '../../models/crop-requirement.model';
import { Crop } from '../../models/crop.model';

@Component({
  selector: 'app-crop-requirements',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './crop-requirements.component.html',
  styleUrls: ['./crop-requirements.component.css']
})
export class CropRequirementsComponent implements OnInit {
  private reqService = inject(CropRequirementsService);
  private cropsService = inject(CropsService);
  private fb = inject(FormBuilder);

  requirements: CropRequirement[] = [];
  crops: Crop[] = [];
  isLoading = true;
  errorMessage = '';

  searchQuery = '';
  selectedSoilFilter = 'All';
  selectedWaterFilter = 'All';

  // Modal & Form State
  showAddModal = false;
  reqForm!: FormGroup;
  isSaving = false;

  // Soil matcher tool
  interactiveSoil = 'Loamy';

  readonly soilList: string[] = ['All', 'Loamy', 'Alluvial', 'Black Cotton', 'Clayey', 'Sandy'];
  readonly waterLevels: string[] = ['All', 'High', 'Moderate', 'Low', 'Very High'];

  get filteredRequirements(): CropRequirement[] {
    return this.requirements.filter(r => {
      const q = this.searchQuery.trim().toLowerCase();
      const cropName = r.crop?.crop_name?.toLowerCase() || '';
      const soil = r.soil_type?.toLowerCase() || '';
      const water = r.water_requirement?.toLowerCase() || '';
      const sunlight = r.sunlight?.toLowerCase() || '';

      const matchesSearch = !q ||
        cropName.includes(q) ||
        soil.includes(q) ||
        water.includes(q) ||
        sunlight.includes(q);

      const matchesSoil = this.selectedSoilFilter === 'All' ||
        soil.includes(this.selectedSoilFilter.toLowerCase());

      const matchesWater = this.selectedWaterFilter === 'All' ||
        water.includes(this.selectedWaterFilter.toLowerCase());

      return matchesSearch && matchesSoil && matchesWater;
    });
  }

  get matchingCropsForInteractiveSoil(): CropRequirement[] {
    const soil = this.interactiveSoil.toLowerCase();
    return this.requirements.filter(r =>
      r.soil_type?.toLowerCase().includes(soil)
    );
  }

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.reqForm = this.fb.group({
      crop_id: ['', [Validators.required]],
      water_requirement: ['Moderate', [Validators.required]],
      soil_type: ['Loamy', [Validators.required]],
      sunlight: ['Full Sun', [Validators.required]],
      temperature: [26, [Validators.required, Validators.min(0), Validators.max(55)]]
    });
  }

  /**
   * DATA ACCESS RULE 4:
   * Load ALL Crop Requirements from database. Never filter by login_id.
   */
  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      reqs: this.reqService.getAllCropRequirements(),
      crops: this.cropsService.getAllCrops()
    }).subscribe({
      next: ({ reqs, crops }) => {
        this.requirements = reqs;
        this.crops = crops;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading crop requirements:', err);
        this.errorMessage = 'Failed to load requirements from Spring Boot at localhost:9000.';
        this.isLoading = false;
      }
    });
  }

  openAddModal(): void {
    const firstCropId = this.crops.length > 0 ? (this.crops[0].id ?? this.crops[0].crop_id) : '';
    this.reqForm.reset({
      crop_id: firstCropId,
      water_requirement: 'Moderate',
      soil_type: 'Loamy',
      sunlight: 'Full Sun',
      temperature: 26
    });
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  saveRequirement(): void {
    if (this.reqForm.invalid) {
      this.reqForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const val = this.reqForm.value;

    const payload: CropRequirementRequest = {
      crop: { id: Number(val.crop_id) },
      water_requirement: val.water_requirement,
      soil_type: val.soil_type,
      sunlight: val.sunlight,
      temperature: Number(val.temperature)
    };

    this.reqService.addCropRequirement(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.showAddModal = false;
        this.loadData();
      },
      error: (err) => {
        this.isSaving = false;
        alert('Failed to save requirement: ' + (err.message || 'Server error.'));
      }
    });
  }
}

