import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth, authState, User } from '@angular/fire/auth';
import { ProfileService, UserProfile } from '../../shared/profile';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class ProfileComponent implements OnInit, OnDestroy {
  private auth = inject(Auth);
  private router = inject(Router);
  private profileService = inject(ProfileService);
  private fb = inject(FormBuilder);

  profileForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  loading = false;
  successMessage = '';
  errorMessage = '';
  currentUser: any;
  private authSubscription?: Subscription;

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mobile: [''],
    });
  }

  ngOnInit(): void {
    console.log('ProfileComponent initialized'); // debugging
    this.loading = true;
    
    this.authSubscription = authState(this.auth).subscribe({
      next: (user) => {
        console.log('auth state changed, user: ', user);
        this.currentUser = user;

        if (user) {
          console.log('user authenticated: ', user);
          console.log('user email: ', user.email);
          this.loadUserProfile();
        } else {
          console.error('no authenticated user found');
          this.loading = false;
          this.errorMessage = 'Please login';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      },
      error: (error) => {
        console.error('Auth state error: ', error);
        this.loading = false;
        this.errorMessage = 'Authentication error';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadUserProfile(): void {
    if (!this.currentUser) {
      console.error('Cannot load user profile');
      return;
    }
    this.loading = true;
    console.log('loading user profile: ', this.currentUser.uid);

    this.profileService.getUserProfile(this.currentUser.uid).subscribe({
      next: (profile) => {
        console.log('profile data retrieved: ', profile);
        if (profile) {
          this.profileForm.patchValue({
            name: profile.name || '',
            email: profile.email || '',
            mobile: profile.mobile || ''
          });
          this.previewUrl = profile.photoURL || null;
        } else {
          console.log('no profile found, using auth data');
          this.createInitialProfile();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile: ', error);
        this.populateFormWithAuthData();
        this.loading = false;
      }
    });
  }

  createInitialProfile(): void {
    if (!this.currentUser) return;
    const initialProfile: Partial<UserProfile> = {
      uid: this.currentUser.uid,
      name: this.currentUser.displayName || '',
      email: this.currentUser.email || '',
      mobile: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log('creating initial profile: ', initialProfile);

    this.profileService.createUserDocument(this.currentUser.uid, initialProfile).subscribe({
      next: () => {
        console.log('initial profile created');
        this.populateFormWithAuthData();
      },
      error: (error) => {
        console.error('Error creating initial profile: ', error);
        this.populateFormWithAuthData();
      }
    });
  }

  populateFormWithAuthData(): void {
    if (!this.currentUser) return;

    console.log('populating form with auth data');
    this.profileForm.patchValue({
      name: this.currentUser.name || '',
      email: this.currentUser.email || '',
      mobile: this.currentUser.mobile || ''
    });
    this.previewUrl = this.currentUser.photoURL || null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      console.log('file selected: ', this.selectedFile.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    console.log('Form submitted');
    console.log('form valid: ', this.profileForm.valid);

    if (this.profileForm.invalid) {
      console.error('form is invalid');
      Object.keys(this.profileForm.controls).forEach(key => {
        const control = this.profileForm.get(key);
        if (control?.invalid) {
          console.error(`Field ${key} is invalid: `, control.errors);
        }
      });
      return;
    }

    if (!this.currentUser) {
      console.error('no authenticated user');
      this.errorMessage = 'no user logged in';
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const profileData: Partial<UserProfile> = {
      name: this.profileForm.value.name,
      email: this.profileForm.value.email,
      mobile: this.profileForm.value.mobile
    };
    console.log('submitting profile data: ', profileData);
    console.log('user id: ', this.currentUser.uid);

    const emailChanged = this.profileForm.value.email !== this.currentUser.email;

    this.profileService.updateCompleteProfile(
      this.currentUser.uid,
      profileData,
      this.selectedFile || undefined
    ).subscribe({
      next: () => {
        console.log('profile update complete');
        if (emailChanged) {
          console.log('updating email...');
          this.profileService.updateUserEmail(this.profileForm.value.email).subscribe({
            next: () => {
              console.log('email update complete');
              this.successMessage = 'Profile and email updated successfully';
              this.loading = false;
              this.selectedFile = null;
            },
            error: (error) => {
              console.error('Error updating email: ', error);
              this.errorMessage = 'Profile updated but failed to update email: ' + error.message;
              this.loading = false;
              this.selectedFile = null;
            }
          });
        } else {
          this.successMessage = 'Profile updated successfully';
          this.loading = false;
          this.selectedFile = null;
        }
      },
      error: (error) => {
        console.error('Error updating profile: ', error);
        this.errorMessage = 'Failed to update profile: ' + error.message;
        this.loading = false;
      }
    });
  }
}