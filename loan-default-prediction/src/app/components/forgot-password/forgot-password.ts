import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../shared/auth';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css'],
  standalone: true
})
export class ForgotPassword {
  email: string = '';

  constructor(private auth: Auth) { }

  forgotPassword() {
    if (!this.email) {
      alert('Please enter your email address.');
      return;
    }
    this.auth.forgotPassword(this.email);
    this.email = '';
  }
}
