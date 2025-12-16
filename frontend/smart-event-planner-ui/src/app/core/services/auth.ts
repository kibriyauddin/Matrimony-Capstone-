import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  // TEMP mock logic (replace with real JWT later)
  isLoggedIn(): boolean {
    return true;
  }

  getUserRole(): string {
    return 'ATTENDEE'; // or 'ORGANIZER'
  }
}
