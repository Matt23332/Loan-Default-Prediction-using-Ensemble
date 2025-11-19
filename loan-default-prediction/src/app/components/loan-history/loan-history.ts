import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { LoanPredictionService, SavedApplication } from '../../shared/loan-prediction';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-loan-history',
  imports: [CommonModule, Navbar],
  templateUrl: './loan-history.html',
  styleUrls: ['./loan-history.css'],
  standalone: true
})
export class LoanHistoryComponent implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);
  private loanService = inject(LoanPredictionService);

  applications: SavedApplication[] = [];
  loading = true;
  errorMessage = '';
  currentUserId: string | null = null;

  ngOnInit(): void {
    authState(this.auth).subscribe({
      next: (user) => {
        if (user) {
          this.currentUserId = user.uid;
          this.loadApplications();
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        console.error('Authentication error');
        this.errorMessage = 'Authentication error';
        this.loading = false;
      }
    });
  }

  loadApplications(): void {
    if (!this.currentUserId) return;

    this.loading = true;
    this.loanService.getUserApplications(this.currentUserId).subscribe({
      next: (applications) => {
        this.applications = applications;
        this.loading = false;
        console.log('Loaded applications:', applications);
      },
      error: (error) => {
        console.error('Error loading applications:', error);
        this.errorMessage = 'Error loading applications';
        this.loading = false;
      }
    });
  }

  viewApplication(applicationId: string): void {
    this.router.navigate(['./application', applicationId]);
  }

  deleteApplication(applicationId: string): void {
    if (!confirm('Are you sure you want to delete this application?')) return;

    this.loanService.deleteApplication(applicationId).subscribe({
      next: () => {
        console.log('Application deleted:', applicationId);
        this.loadApplications();
      },
      error: (error) => {
        console.error('Error deleting application:', error);
        this.errorMessage = 'Error deleting application';
        alert('Failed to delete application.');
      }
    });
  }
  
  newApplication(): void {
    this.router.navigate(['/loan-application']);
  }

  getStatusClass(prediction: string): string {
    return prediction === 'Approved' ? 'status-approved' : 'status-denied';
  }

  getRiskLevel(riskScore: number): string {
    if (riskScore < 0.3) return 'Low';
    if (riskScore < 0.7) return 'Medium';
    return 'High';
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
