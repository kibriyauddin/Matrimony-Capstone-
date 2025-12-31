import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test-api',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px;">
      <h2>API Test</h2>
      <button (click)="testHealth()">Test Health API</button>
      <button (click)="testEvents()">Test Events API</button>
      <button (click)="testRegister()">Test Register API</button>
      
      <div *ngIf="result" style="margin-top: 20px; padding: 10px; background: #f0f0f0;">
        <h3>Result:</h3>
        <pre>{{ result | json }}</pre>
      </div>
      
      <div *ngIf="error" style="margin-top: 20px; padding: 10px; background: #ffebee; color: red;">
        <h3>Error:</h3>
        <pre>{{ error | json }}</pre>
      </div>
    </div>
  `
})
export class TestApiComponent implements OnInit {
  result: any = null;
  error: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    console.log('TestApiComponent loaded');
  }

  testHealth(): void {
    this.result = null;
    this.error = null;
    
    this.http.get('http://localhost:3002/api/health').subscribe({
      next: (response) => {
        this.result = response;
        console.log('Health API success:', response);
      },
      error: (error) => {
        this.error = error;
        console.error('Health API error:', error);
      }
    });
  }

  testEvents(): void {
    this.result = null;
    this.error = null;
    
    this.http.get('http://localhost:3002/api/events').subscribe({
      next: (response) => {
        this.result = response;
        console.log('Events API success:', response);
      },
      error: (error) => {
        this.error = error;
        console.error('Events API error:', error);
      }
    });
  }

  testRegister(): void {
    this.result = null;
    this.error = null;
    
    const testUser = {
      name: 'Test User',
      email: 'test' + Date.now() + '@example.com',
      password: 'password123',
      role: 'attendee'
    };
    
    this.http.post('http://localhost:3002/api/auth/register', testUser).subscribe({
      next: (response) => {
        this.result = response;
        console.log('Register API success:', response);
      },
      error: (error) => {
        this.error = error;
        console.error('Register API error:', error);
      }
    });
  }
}