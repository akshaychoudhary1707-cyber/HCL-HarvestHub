import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  private authService = inject(AuthService);

  @Input() isOpen = true;
  @Output() closeSidebar = new EventEmitter<void>();

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get loginId() {
    return this.authService.getLoginId();
  }

  onLogout(): void {
    this.authService.logout();
  }
}

