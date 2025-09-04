import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-auth',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [CommonModule, ReactiveFormsModule]
})

export class Login {
  loginForm: FormGroup;
  signupForm: FormGroup;
  isLogin = true; // toggle state

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      number: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      password: ['', Validators.required]
    });
  }

  toggleForm() {
    this.isLogin = !this.isLogin;
  }

  onLogin() {
    if (this.loginForm.valid) {
      console.log('Login Data:', this.loginForm.value);
    }
  }

  onSignup() {
    if (this.signupForm.valid) {
      console.log('Signup Data:', this.signupForm.value);
    }
  }
}
