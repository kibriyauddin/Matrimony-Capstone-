import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.snackBar.open('Please fill in all fields', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.loading = false;
        this.snackBar.open('Login successful!', 'Close', { duration: 3000 });

        // Navigate based on role
        if (response.user.role === 'organizer') {
          this.router.navigate(['/organizer/dashboard']);
        } else {
          this.router.navigate(['/events']);
        }
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open(error.error.error || 'Login failed', 'Close', {
          duration: 3000,
        });
      },
    });
  }
}
