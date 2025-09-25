import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../shared/auth';
import { Router } from '@angular/router';
import { onAuthStateChanged, User } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar {
  userEmail: string | null = '';

  constructor(private auth: Auth, private router: Router, private fireAuth: AngularFireAuth) { }

  ngOnInit(): void {
    this.fireAuth.authState.subscribe(user => {
      this.userEmail = user ? user.email : null;
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
