import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Navbar } from "../../shared/navbar/navbar";
import { Auth, authState } from '@angular/fire/auth';
import { LoanPredictionService, LoanApplication, PredictionResult } from '../../shared/loan-prediction';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { set } from '@angular/fire/database';


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
  predictionResult: any = null;
  currentUserId: string | null = null;
  maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed'];
  educationOptions = ['Bachelor\'s', 'Master\'s', 'PhD', 'Other'];
  employmentTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship', 'Self-Employed', 'Unemployed'];
  employmentStatusOptions = ['Employed', 'Unemployed', 'Self-Employed', 'Student', 'Retired'];
  homeOwnershipOptions = ['Rent', 'Own', 'Mortgage', 'Other'];
  loanPurposeOptions = ['Debt Consolidation', 'Home Improvement', 'Major Purchase', 'Small Business', 'Car', 'Wedding', 'Medical', 'Vacation', 'Other'];

  constructor() {
    this.loanForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      age: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      income: ['', [Validators.required, Validators.min(0)]],
      employmentStatus: ['', [Validators.required]],
      homeOwnership: ['', [Validators.required]],
      creditScore: ['', [Validators.required, Validators.min(300), Validators.max(850)]],
      loanAmount: ['', [Validators.required, Validators.min(1000)]],
      loanPurpose: ['', [Validators.required]],
      loanTerm: ['', [Validators.required, Validators.min(6)]],
      interestRate: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      monthsEmployed: ['', [Validators.required, Validators.min(0)]],
      numCreditLines: ['', [Validators.required, Validators.min(0)]],
      maritalStatus: ['', [Validators.required]],
      hasDependents: ['', [Validators.required]],
      hasCoSigner: ['', [Validators.required]],
      hasMortgage: ['', [Validators.required]],
      education: ['', [Validators.required]],
      employmentType: ['', [Validators.required]],
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

  // Call API directly - no Firestore
  this.loanService.getPrediction(this.currentUserId, loanData).subscribe({
    next: (result) => {
      console.log('Application ID:', result.applicationId);
      console.log('Prediction received:', result);
      this.loading = false;
      this.predictionResult = result.prediction;
      this.successMessage = `Application processed successfully! Application ID: ${result.applicationId}`;
    },
    error: (error) => {
      console.error('Error submitting application:', error);
      this.loading = false;
      
      if (error.status === 0) {
        this.errorMessage = 'Cannot connect to the prediction service. Please check if the API is running.';
      } else if (error.status === 500) {
        this.errorMessage = 'Server error: ' + (error.error?.detail || 'Please try again later.');
      } else if (error.status === 422) {
        this.errorMessage = 'Invalid data: ' + (error.error?.detail || 'Please check your form inputs.');
      } else {
        this.errorMessage = 'Failed to submit application: ' + (error.error?.detail || error.message || 'Unknown error');
      }
    }
  });
}

  resetForm(): void {
    this.loanForm.reset();
    this.successMessage = '';
    this.errorMessage = '';
    this.predictionResult = null;
  }

  isApproved(): boolean {
    return this.predictionResult?.modelPrediction === 'No Default';
  }

  isRejected(): boolean {
    return this.predictionResult?.modelPrediction === 'Default';
  }

  getRiskLevel(): string {
    if (!this.predictionResult) return '';

    const risk = this.predictionResult.riskScore;
    if (risk < 0.3) return 'low';
    if (risk < 0.6) return 'medium';
    return 'high';
  }

  getRiskColor(): string {
    const level = this.getRiskLevel();
    switch (level) {
      case 'low': return 'green';
      case 'medium': return 'orange';
      case 'high': return 'red';
      default: return 'black';
    }
  }

  getStatusMessage(): string {
    if (!this.predictionResult) return '';

    if (this.isApproved()) {
      return 'Congratulations! Your loan application has been approved.';
    } else {
      return 'Unfortunately, your loan application has been rejected.';
    }
  }

  goToForm() {
    this.router.navigate(['/loan-application']);
  }

  viewApplications() {
    this.router.navigate(['/loan-history']);
  }

  getGaugeArc(riskScore: number): string {
    const startAngle = 180;
    const endAngle = 0;
    const totalAngle = startAngle - endAngle;

    const angle = startAngle - (riskScore * totalAngle);
    const radians = (angle * Math.PI) / 180;

    const centerX = 100;
    const centerY = 100;
    const radius = 80;

    const x = centerX + radius * Math.cos(radians);
    const y = centerY - radius * Math.sin(radians);

    const largeArcFlag = riskScore > 0.5 ? 1 : 0;

    return `M 20 100 A 80 80 0 ${largeArcFlag} 1 ${x} ${y}`;
  }

  // Mark all controls in a form group as touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }
}
