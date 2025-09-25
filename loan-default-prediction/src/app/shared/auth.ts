import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider, User } from 'firebase/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  constructor(private fireAuth: AngularFireAuth, private router: Router) { }

  login(email: string, password: string): Promise<void> {
    return this.fireAuth.signInWithEmailAndPassword(email, password).then( res => {
      localStorage.setItem('token', 'true');

      if (res.user?.emailVerified === true) {
        this.router.navigate(['dashboard']);
      } else {
        this.router.navigate(['/verify-email']);
      }
    }, err => {
      alert(err.message);
      this.router.navigate(['/login']);
    })
  }

  register(email: string, password: string): Promise<void> {
    return this.fireAuth.createUserWithEmailAndPassword(email, password).then( res => {
      alert('Registration Successful');
      this.router.navigate(['/login']);
      this.sendEmailForVerification(res.user);
    }, err => {
      alert(err.message);
      this.router.navigate(['/login']);
    })
  }

  logout(): Promise<void> {
    return this.fireAuth.signOut().then( () => {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    }, err => {
      alert(err.message);
    })
  }

  forgotPassword(email: string) {
    this.fireAuth.sendPasswordResetEmail(email).then ( () => {
      this.router.navigate(['/verify-email']);
    }, err => {
      alert('Something went wrong');
    })
  }

  sendEmailForVerification(user: any) {
    console.log(user);
    user.sendEmailVerification().then( (res: any) => {
      this.router.navigate(['/verify-email']);
    }, (err: any) => {
      alert('Something went wrong. Not able to send mail');
    })
  }

  googleSignIn(): Promise<void> {
    return this.fireAuth.signInWithPopup(new GoogleAuthProvider).then( res => {
      this.router.navigate(['/dashboard']);
      localStorage.setItem('token', JSON.stringify(res.user?.uid));
    }, err => {
      alert(err.message);
    })
  }

  getCurrentUser(): Promise<firebase.default.User | null> {
    return this.fireAuth.currentUser;
  }
}
