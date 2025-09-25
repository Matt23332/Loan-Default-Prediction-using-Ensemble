import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../shared/auth';

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

  constructor(private auth: Auth) { }

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
}
