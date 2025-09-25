import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../shared/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar {
  userEmail: string | null = '';

  constructor(private auth: Auth, private router: Router) { }

  ngOnInit(): void {
    this.auth.getCurrentUser().then(user => {
      if (user) {
        this.userEmail = user.email;
      } else {
        this.userEmail = null;
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
