import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../shared/auth';
import { ProfileService } from '../../shared/profile';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  standalone: true
})
export class Register {
  email: string = '';
  password: string = '';

  constructor(private auth: Auth, private profileService: ProfileService, private router: Router) { }

  register() {
    if (this.email == '') {
      alert('Please enter an email address.');
      return;
    }
    if (this.password == '') {
      alert('Please enter a password.');
      return;
    }

    this.auth.register(this.email, this.password);
    this.email = '';
    this.password = '';
  }

  onRegisterSuccess(userCredential: any) {
    const user = userCredential.user;

    const initialProfile = {
      uid: user.uid,
      name: user.name || '',
      email: user.email || '',
      mobile: '',
      photoURL: user.photoURL || '',
      createdAt: new Date()
    };

    this.profileService.createUserDocument(user.uid, initialProfile).subscribe({
      next: () => {
        console.log('user profile has been created');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('error creating user profile: ', error);
        this.router.navigate(['/login']);
      }
    });
  }
}
