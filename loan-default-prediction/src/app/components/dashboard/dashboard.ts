import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../shared/auth';
import { Router } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
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

  goToForm() {
    this.router.navigate(['/loan-application']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
