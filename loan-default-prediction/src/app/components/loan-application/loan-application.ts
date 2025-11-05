import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Navbar } from "../../shared/navbar/navbar";
import { Auth, authState } from '@angular/fire/auth';
import { LoanPredictionService, LoanApplication } from '../../shared/loan-prediction';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-loan-application',
  imports: [ReactiveFormsModule, RouterModule, Navbar, CommonModule],
  templateUrl: './loan-application.html',
  styleUrls: ['./loan-application.css'],
  standalone: true
})
export class LoanApplicationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(Auth);
  private loanService = inject(LoanPredictionService);
  private destroyRef = inject(DestroyRef);

  loanForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  predictionResult: any;
  currentUserId: string | null = null;
  employmentStatusOptions = ['Employed', 'Unemployed', 'Self-Employed', 'Student', 'Retired'];
  homeOwnershipOptions = ['Rent', 'Own', 'Mortgage', 'Other'];
  loanPurposeOptions = ['Debt Consolidation', 'Home Improvement', 'Major Purchase', 'Small Business', 'Car', 'Wedding', 'Medical', 'Vacation', 'Other'];

  constructor() {
    this.loanForm = this.fb.group({
      age: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      income: ['', [Validators.required, Validators.min(0)]],
      employmentStatus: ['', [Validators.required]],
      homeOwnership: ['', [Validators.required]],
      creditScore: ['', [Validators.required, Validators.min(300), Validators.max(850)]],
      loanAmount: ['', [Validators.required, Validators.min(1000)]],
      loanPurpose: ['', [Validators.required]],
      loanTerm: ['', [Validators.required, Validators.min(6)]],
      interestRate: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      debtToIncomeRatio: ['', [Validators.required, Validators.min(0), Validators.max(100)]]
    });

    authState(this.auth).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (user) => {
        if (user) {
          this.currentUserId = user.uid;
          console.log('User authenticated: ', user.uid);
        } else {
          console.log('No user authenticated');
          this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        console.error('authentication error: ', error);
      }
    });
  }

  ngOnInit(): void {
    console.log('Loan application component initialized');
  }

  onSubmit(): void {
    console.log('Loan application submitted');

    if (this.loanForm.invalid) {
      console.error('Invalid form');
      this.markFormGroupTouched(this.loanForm);
      return;
    }

    if (!this.currentUserId) {
      this.errorMessage = 'User not authenticated';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.predictionResult = null;

    const loanData: Partial<LoanApplication> = this.loanForm.value;

    this.loanService.submitLoanApplication(this.currentUserId, loanData).subscribe({
      next: (applicationId) => {
        console.log('Loan application submitted: ', applicationId);
        this.loanService.getApplication(applicationId).subscribe({
          next: (application) => {
            if (application?.prediction) {
              this.predictionResult = application.prediction;
              this.successMessage = `Application submitted successfully! Your loan application ID is ${applicationId}.`;
            }
          },
          error: (error) => {
            console.error('Error fetching application: ', error);
            this.loading = false;
            this.successMessage = `Application submitted successfully! (ID: ${applicationId})`;
          }
        });
      },
      error: (error) => {
        console.error('Error submitting application: ', error);
        this.errorMessage = 'Failed to submit application: ' + (error.message || 'Unknown error');
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  resetForm(): void {
    this.loanForm.reset();
    this.successMessage = '';
    this.errorMessage = '';
    this.predictionResult = null;
  }

  goToForm() {
    this.router.navigate(['/loan-application']);
  }

  viewApplications() {
    this.router.navigate(['/loan-history']);
  }
}
