import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(private router: Router) {
    const user = localStorage.getItem('userLogin');
    if (user) {
      this.userSubject.next(JSON.parse(user));
    }
  }

  login(user: any) {
    localStorage.setItem('userLogin', JSON.stringify(user));
    this.userSubject.next(user);
  }

  logout() {
    localStorage.removeItem('userLogin');
    this.router.navigate(['/login']).then(() => {
        window.location.reload();
    this.userSubject.next(null);
    });
  }

  updateUserType(newType: string) {
    const user = JSON.parse(localStorage.getItem('userLogin') || '{}');
    user.tipo = newType;
    localStorage.setItem('userLogin', JSON.stringify(user));
    this.userSubject.next(user);
  }

}