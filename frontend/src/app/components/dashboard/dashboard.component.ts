import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { FarmsService } from '../../services/farms.service';
import { CropPlansService } from '../../services/crop-plans.service';
import { CropsService } from '../../services/crops.service';
import { CropRequirementsService } from '../../services/crop-requirements.service';
import { Farm } from '../../models/farm.model';
import { CropPlan } from '../../models/crop-plan.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public authService = inject(AuthService);
  private farmsService = inject(FarmsService);
  private cropPlansService = inject(CropPlansService);
  private cropsService = inject(CropsService);
  private requirementsService = inject(CropRequirementsService);

  isLoading = true;
  errorMessage = '';

  // Data metrics
  myFarms: Farm[] = [];
  myCropPlans: CropPlan[] = [];
  totalCropsCount = 0;
  totalRequirementsCount = 0;

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get loginId() {
    return this.authService.getLoginId();
  }

  get totalAcreage(): number {
    return this.myFarms.reduce((sum, f) => sum + (Number(f.area) || 0), 0);
  }

  get totalExpectedYield(): number {
    return this.myCropPlans.reduce((sum, p) => sum + (Number(p.expected_yield_kg) || 0), 0);
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      farms: this.farmsService.getMyFarms(),
      plans: this.cropPlansService.getMyCropPlans(),
      crops: this.cropsService.getAllCrops(),
      requirements: this.requirementsService.getAllCropRequirements()
    }).subscribe({
      next: ({ farms, plans, crops, requirements }) => {
        this.myFarms = farms;
        this.myCropPlans = plans;
        this.totalCropsCount = crops.length;
        this.totalRequirementsCount = requirements.length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.errorMessage = 'Unable to connect to the backend server at localhost:9000. Please ensure Spring Boot is running.';
        this.isLoading = false;
      }
    });
  }
}

