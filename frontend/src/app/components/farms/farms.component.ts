import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { FarmsService } from '../../services/farms.service';
import { AuthService } from '../../services/auth.service';
import { Farm } from '../../models/farm.model';

@Component({
  selector: 'app-farms',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './farms.component.html',
  styleUrls: ['./farms.component.css']
})
export class FarmsComponent implements OnInit {
  private farmsService = inject(FarmsService);
  public authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  farms: Farm[] = [];
  isLoading = true;
  errorMessage = '';
  searchQuery = '';

  // Modal & Form state
  showAddModal = false;
  farmForm!: FormGroup;
  isSaving = false;
  deletingFarmId: number | null = null;

  // Soil choices
  readonly soilTypes: string[] = [
    'Loamy Soil',
    'Alluvial Soil',
    'Black Cotton Soil',
    'Clayey Soil',
    'Sandy Loam Soil',
    'Red & Laterite Soil'
  ];

  // Season choices
  readonly seasons: string[] = [
    'Kharif',
    'Rabi',
    'Zaid',
    'Whole Year'
  ];

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get filteredFarms(): Farm[] {
    if (!this.searchQuery.trim()) {
      return this.farms;
    }
    const q = this.searchQuery.toLowerCase();
    return this.farms.filter(
      f =>
        f.farm_name.toLowerCase().includes(q) ||
        f.farm_location.toLowerCase().includes(q) ||
        f.soil_type.toLowerCase().includes(q) ||
        (f.season && f.season.toLowerCase().includes(q))
    );
  }

  get totalAcreage(): number {
    return this.farms.reduce((acc, f) => acc + (Number(f.area) || 0), 0);
  }

  ngOnInit(): void {
    this.initForm();
    this.loadFarms();
  }

  initForm(): void {
    this.farmForm = this.fb.group({
      farm_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      farm_location: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      area: [10, [Validators.required, Validators.min(0.1)]],
      soil_type: ['Loamy Soil', [Validators.required]],
      season: ['Kharif', [Validators.required]]
    });
  }

  loadFarms(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.farmsService.getMyFarms().subscribe({
      next: (data) => {
        this.farms = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching farms:', err);
        this.errorMessage = 'Failed to load farms from backend. Please ensure Spring Boot is running at localhost:9000.';
        this.isLoading = false;
      }
    });
  }

  openAddModal(): void {
    this.farmForm.reset({
      farm_name: '',
      farm_location: '',
      area: 10,
      soil_type: 'Loamy Soil',
      season: 'Kharif'
    });
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  saveFarm(): void {
    if (this.farmForm.invalid) {
      this.farmForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const formVal = this.farmForm.value;

    this.farmsService.addFarm({
      farm_name: formVal.farm_name,
      farm_location: formVal.farm_location,
      area: Number(formVal.area),
      soil_type: formVal.soil_type,
      season: formVal.season
    }).subscribe({
      next: (createdFarm) => {
        this.isSaving = false;
        this.showAddModal = false;
        this.loadFarms();
        // Immediately see the generated plan for this farm
        const targetId = createdFarm?.farm_id;
        if (targetId) {
          this.router.navigate(['/crop-plans'], { queryParams: { farmId: targetId } });
        } else {
          this.router.navigate(['/crop-plans']);
        }
      },
      error: (err) => {
        this.isSaving = false;
        alert('Error saving farm: ' + (err.message || 'Please check backend logs.'));
      }
    });
  }

  deleteFarm(id: number | undefined): void {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this farm? Any crop plans linked to it will also be removed.')) {
      return;
    }

    this.deletingFarmId = id;
    this.farmsService.deleteFarm(id).subscribe({
      next: () => {
        this.deletingFarmId = null;
        this.loadFarms();
      },
      error: (err) => {
        this.deletingFarmId = null;
        alert('Error deleting farm: ' + (err.message || 'Server error.'));
      }
    });
  }

  viewCropPlanForFarm(farm: Farm): void {
    this.router.navigate(['/crop-plans'], {
      queryParams: { farmId: farm.farm_id }
    });
  }
}
