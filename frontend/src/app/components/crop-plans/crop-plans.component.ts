import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CropPlansService } from '../../services/crop-plans.service';
import { FarmsService } from '../../services/farms.service';
import { AuthService } from '../../services/auth.service';
import { CropPlan } from '../../models/crop-plan.model';
import { Farm } from '../../models/farm.model';

@Component({
  selector: 'app-crop-plans',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './crop-plans.component.html',
  styleUrls: ['./crop-plans.component.css']
})
export class CropPlansComponent implements OnInit {
  private cropPlansService = inject(CropPlansService);
  private farmsService = inject(FarmsService);
  public authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  cropPlans: CropPlan[] = [];
  userFarms: Farm[] = [];

  isLoading = true;
  errorMessage = '';
  selectedSeasonFilter = 'All';
  selectedFarmFilter = 'All';
  deletingPlanId: number | null = null;
  generatingForFarmId: number | null = null;

  readonly seasons: string[] = ['All', 'Kharif', 'Rabi', 'Zaid', 'Whole Year'];

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get filteredPlans(): CropPlan[] {
    return this.cropPlans.filter(p => {
      const matchesSeason = this.selectedSeasonFilter === 'All' ||
        p.season?.toLowerCase().includes(this.selectedSeasonFilter.toLowerCase());

      const matchesFarm = this.selectedFarmFilter === 'All' ||
        (p.farm && p.farm.farm_name?.toLowerCase() === this.selectedFarmFilter.toLowerCase());

      return matchesSeason && matchesFarm;
    });
  }

  get totalExpectedYield(): number {
    return this.cropPlans.reduce((sum, p) => sum + (Number(p.expected_yield_kg) || 0), 0);
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      farms: this.farmsService.getMyFarms(),
      plans: this.cropPlansService.getMyCropPlans()
    }).subscribe({
      next: ({ farms, plans }) => {
        this.userFarms = farms;
        this.cropPlans = plans;
        this.isLoading = false;

        // If navigated with a specific farm filter query param
        const queryFarmId = this.route.snapshot.queryParams['farmId'];
        if (queryFarmId) {
          const matchedFarm = this.userFarms.find(f => f.farm_id === Number(queryFarmId));
          if (matchedFarm) {
            this.selectedFarmFilter = matchedFarm.farm_name;
          }
        }
      },
      error: (err) => {
        console.error('Error loading crop plans data:', err);
        this.errorMessage = 'Unable to load crop plans. Please ensure the backend is running.';
        this.isLoading = false;
      }
    });
  }

  generateCropPlan(farm: Farm): void {
    if (!farm.farm_id) return;
    this.generatingForFarmId = farm.farm_id;

    this.cropPlansService.generatePlanForFarm(farm.farm_id).subscribe({
      next: () => {
        this.generatingForFarmId = null;
        this.loadData();
      },
      error: (err) => {
        this.generatingForFarmId = null;
        alert('Failed to generate crop plan: ' + (err.message || 'Server error'));
      }
    });
  }

  deletePlan(id: number | undefined): void {
    if (!id) return;
    if (!confirm('Are you sure you want to remove this crop plan?')) {
      return;
    }

    this.deletingPlanId = id;
    this.cropPlansService.deleteCropPlan(id).subscribe({
      next: () => {
        this.deletingPlanId = null;
        this.loadData();
      },
      error: (err) => {
        this.deletingPlanId = null;
        alert('Error deleting crop plan: ' + (err.message || 'Server error.'));
      }
    });
  }
}
