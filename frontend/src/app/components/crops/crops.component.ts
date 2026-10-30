import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CropsService } from '../../services/crops.service';
import { Crop } from '../../models/crop.model';

@Component({
  selector: 'app-crops',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './crops.component.html',
  styleUrls: ['./crops.component.css']
})
export class CropsComponent implements OnInit {
  private cropsService = inject(CropsService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  crops: Crop[] = [];
  isLoading = true;
  errorMessage = '';

  searchQuery = '';
  selectedSeasonFilter = 'All';
  selectedTypeFilter = 'All';

  // Modal & Form State
  showAddModal = false;
  cropForm!: FormGroup;
  isSaving = false;
  viewingCrop: Crop | null = null;

  readonly seasons: string[] = ['All', 'Kharif', 'Rabi', 'Zaid', 'Summer', 'Whole Year'];
  readonly cropTypes: string[] = ['All', 'Cereal', 'Pulse', 'Cash Crop', 'Vegetable', 'Oilseed', 'Fiber'];

  get filteredCrops(): Crop[] {
    return this.crops.filter(c => {
      // Search text match
      const q = this.searchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        c.crop_name.toLowerCase().includes(q) ||
        c.crop_type.toLowerCase().includes(q) ||
        c.crop_season.toLowerCase().includes(q);

      // Season filter match
      const matchesSeason = this.selectedSeasonFilter === 'All' ||
        c.crop_season.toLowerCase().includes(this.selectedSeasonFilter.toLowerCase());

      // Type filter match
      const matchesType = this.selectedTypeFilter === 'All' ||
        c.crop_type.toLowerCase().includes(this.selectedTypeFilter.toLowerCase());

      return matchesSearch && matchesSeason && matchesType;
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.loadCrops();
  }

  initForm(): void {
    this.cropForm = this.fb.group({
      crop_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
      crop_season: ['Kharif', [Validators.required]],
      crop_type: ['Cereal', [Validators.required]],
      growing_days: [120, [Validators.required, Validators.min(10), Validators.max(500)]]
    });
  }

  /**
   * DATA ACCESS RULE 3:
   * Load ALL crops from database. No login_id filtering.
   */
  loadCrops(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.cropsService.getAllCrops().subscribe({
      next: (data) => {
        this.crops = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading crops:', err);
        this.errorMessage = 'Failed to load crops from Spring Boot backend at localhost:9000.';
        this.isLoading = false;
      }
    });
  }

  openAddModal(): void {
    this.cropForm.reset({
      crop_name: '',
      crop_season: 'Kharif',
      crop_type: 'Cereal',
      growing_days: 120
    });
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  saveCrop(): void {
    if (this.cropForm.invalid) {
      this.cropForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const val = this.cropForm.value;

    this.cropsService.addCrop({
      crop_name: val.crop_name,
      crop_season: val.crop_season,
      crop_type: val.crop_type,
      growing_days: Number(val.growing_days)
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.showAddModal = false;
        this.loadCrops();
      },
      error: (err) => {
        this.isSaving = false;
        alert('Failed to save crop: ' + (err.message || 'Server error.'));
      }
    });
  }

  viewCropDetails(crop: Crop): void {
    this.viewingCrop = crop;
  }

  closeCropDetails(): void {
    this.viewingCrop = null;
  }

  planWithCrop(crop: Crop): void {
    this.router.navigate(['/crop-plans'], {
      queryParams: { cropId: crop.id ?? crop.crop_id }
    });
  }
}

