import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true
})
export class Login {
  email: string = '';
  password: string = '';
  message: string | null = null;
  isError = false;

  constructor(private auth: Auth, private router: Router) { }

  login() {
    if (!this.email || !this.password) {
      this.message = 'Please fill in all fields';
      this.isError = true;
      return;
    }

    signInWithEmailAndPassword(this.auth, this.email, this.password).then(res => {
      this.message = 'Login successful';
      this.isError = false;
      localStorage.setItem('token', 'true');
      this.router.navigate(['/dashboard']);
    }).catch(err => {
      this.message = 'Login failed';
      this.isError = true;
    });
  }

  signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.auth, provider).then((result) => {
      this.message = 'Login successful';
      this.isError = false;
      localStorage.setItem('token', 'true');
      this.router.navigate(['/dashboard']);
    })
    .catch((error) => {
      this.message = 'Google sign-in failed';
      this.isError = true;
    });
  }
}
