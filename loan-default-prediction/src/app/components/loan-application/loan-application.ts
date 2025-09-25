import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Navbar } from "../../shared/navbar/navbar";

@Component({
  selector: 'app-loan-application',
  imports: [ReactiveFormsModule, RouterModule, Navbar],
  templateUrl: './loan-application.html',
  styleUrls: ['./loan-application.css'],
  standalone: true
})
export class LoanApplication {
  loanForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loanForm = this.fb.group({
      name: ['', Validators.required],
      income: ['', Validators.required],
      loanAmount: ['', Validators.required],
      loanPurpose: ['', Validators.required],
      creditScore: ['', Validators.required],
      employmentStatus: ['', Validators.required],
      loanTerm: ['', Validators.required],
    });
  }

  submitApplication() {
    if (this.loanForm.valid) {
      console.log('Loan Application submitted', this.loanForm.value);
      // Add code to send the application to the backend
      alert('Application submitted successfully!');
      this.loanForm.reset();
    } else {
      alert('Please fill in all required fields.');
    }
  }

  goToForm() {
    this.router.navigate(['/loan-application']);
  }
}
