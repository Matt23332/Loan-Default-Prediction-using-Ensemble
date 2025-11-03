import { Injectable, inject } from '@angular/core';
import { Firestore, doc, updateDoc, getDoc, setDoc, DocumentReference } from '@angular/fire/firestore';
import { Auth, updateProfile, updateEmail, updatePhoneNumber, User, updatePassword } from '@angular/fire/auth';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

export interface UserProfile {
  uid: string;
  name?: string;
  email?: string;
  mobile?: string;
  photoURL?: string;
  createdAt?: Date;
  updatedAt?: Date; 
}

@Injectable({
  providedIn: 'root'
})

export class ProfileService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private storage = inject(Storage);

  constructor() {
    console.log('ProfileService initialized');
  }

  updateProfile(userId: string, profileData: Partial<UserProfile>): Observable<void> {
    console.log('Updating profile for userId: ', userId, ' with data: ', profileData); // debugging

    const userDocRef = doc(this.firestore, `users/${userId}`);
    const updateData = {
      ...profileData,
      updatedAt: new Date()
    };

    return from(setDoc(userDocRef, updateData, { merge: true })).pipe(
      tap(() => console.log('Profile update complete in firestore')),
      catchError(error => {
        console.error('Error updating profile: ', error);
        console.error('Error code: ', error.code);
        console.error('Error message: ', error.message)
        return throwError(() => error);
      })
    );
  }

  updateAuthProfile(name?: string, photoURL?: string): Observable<void> {
    const user = this.auth.currentUser;
    console.log('Current user: ', user); // debugging

    if (!user) {
      console.error('No authenticated user found'); // debugging
      return throwError(() => new Error('No authenticated user found'));
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (photoURL !== undefined) updates.photoURL = photoURL;

    console.log('Updating auth profile with: ', updates); // debugging

    return from(updateProfile(user, updates)).pipe(
      catchError(error => {
        console.error('Error updating auth profile: ', error);
        return throwError(() => error);
      })
    );
  }

  updateUserEmail(newEmail: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) {
      return throwError(() => new Error('No user logged in'));
    }

    return from(updateEmail(user, newEmail)).pipe(
      catchError(error => {
        console.error('Error updating email: ', error);
        return throwError(() => error);
      })
    );
  }

  updateUserPassword(newPassword: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) {
      return throwError(() => new Error('No user logged in'));
    }

    return from(updatePassword(user, newPassword)).pipe(
      catchError(error => {
        console.error('Error updating password: ', error);
        return throwError(() => error);
      })
    );
  }

  uploadProfilePicture(userId: string, file: File): Observable<string> {
    console.log('Uploading profile picture for userId: ', userId); // debugging
    const filePath = `profile_pictures/${userId}/${Date.now()}_${file.name}`;
    const storageRef = ref(this.storage, filePath);

    return from(uploadBytes(storageRef, file)).pipe(
      tap(() => console.log('Profile picture uploaded to storage')),
      switchMap(() => from(getDownloadURL(storageRef))),
      tap(url => console.log('Retrieved download URL: ', url)),
      catchError(error => {
        console.error('Error uploading profile picture: ', error);
        return throwError(() => error);
      })
    );
  }

  getUserProfile(userId: string): Observable<UserProfile | null> {
    console.log('Fetching profile for userId: ', userId); // debugging

    const userDocRef = doc(this.firestore, `users/${userId}`);
    return from(getDoc(userDocRef)).pipe(
      switchMap(docSnap => {
        if (docSnap.exists()) {
          console.log('Profile data retrieved: ', docSnap.data()); // debugging
          return from([{ uid: userId, ...docSnap.data() } as UserProfile]);
        } else {
          console.log('No profile found for userId: ', userId); // debugging
          return from([null]);
        }
      }),
      catchError(error => {
        console.error('Error fetching user profile: ', error);
        return throwError(() => error);
      })
    );
  }

  updateCompleteProfile(userId: string, profileData: Partial<UserProfile>, photoFile?: File): Observable<void> {
    console.log('Starting complete profile update for userId: ', userId); // debugging
    console.log('Profile data: ', profileData); // debugging
    console.log('Photo file: ', photoFile); // debugging

    if (photoFile) {
      return this.uploadProfilePicture(userId, photoFile).pipe(
        tap(photoURL => console.log('Photo uploaded, URL: ', photoURL)), // debugging
        switchMap(photoURL => {
          const completeData = { ...profileData, photoURL };
          return this.updateProfile(userId, completeData).pipe(
            switchMap(() => this.updateAuthProfile(profileData.name, profileData.photoURL))
          );
        }),
        tap(() => console.log('Complete profile update finished')),
        catchError(error => {
          console.error('Error in complete profile update: ', error);
          return throwError(() => error);
        })
      );
    } else {
      return this.updateProfile(userId, profileData).pipe(
        switchMap(() => {
          if (profileData.name || profileData.photoURL) {
            return this.updateAuthProfile(profileData.name, profileData.photoURL);
          }
          return from([undefined]);
        }),
        tap(() => console.log('Complete profile update finished without photo upload')),
        catchError(error => {
          console.error('Error in complete profile update: ', error);
          return throwError(() => error);
        })
      );
    }
  }

  // Test method
  createUserDocument(userId: string, userData: Partial<UserProfile>): Observable<void> {
    console.log('Creating initial user document for: ', userId);
    const userDocRef = doc(this.firestore, `users/${userId}`);
    const newUser = {
      uid: userId,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return from(setDoc(userDocRef, newUser)).pipe(
      tap(() => console.log('User document created successfully')),
      catchError(error => {
        console.error('Error creating user document: ', error);
        return throwError(() => error);
      })
    );
  }
}