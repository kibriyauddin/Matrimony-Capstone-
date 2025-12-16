import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  email = '';
  password = '';
  full_name = '';
  role = 'attendee';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onRegister() {
    if (!this.email || !this.password || !this.full_name) {
      this.snackBar.open('Please fill in all fields', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.loading = true;
    this.authService
      .register(this.email, this.password, this.full_name, this.role)
      .subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open(
            'Registration successful! Please login.',
            'Close',
            { duration: 3000 }
          );
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(
            error.error.error || 'Registration failed',
            'Close',
            { duration: 3000 }
          );
        },
      });
  }
}
