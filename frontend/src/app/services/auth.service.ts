import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { LoginUser } from '../models/auth.model';

const STORAGE_KEY = 'harvesthub_auth_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Spring Boot Login controller runs on port 9000: @RequestMapping("/Login")
  private readonly baseUrl = 'http://localhost:9000/Login';

  // BehaviorSubject holding current authenticated user state
  private currentUserSubject = new BehaviorSubject<LoginUser | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

  /**
   * Helper to normalize login_id since backend entity field is "int Login_id"
   * Jackson may serialize as "login_id" or "Login_id".
   */
  public extractLoginId(user: LoginUser | null | undefined): number | null {
    if (!user) return null;
    const id = user.login_id ?? user.Login_id;
    return id !== undefined && id !== null ? Number(id) : null;
  }

  /**
   * Returns current user's login_id
   */
  public getLoginId(): number | null {
    return this.extractLoginId(this.currentUserSubject.value);
  }

  /**
   * Returns current user object
   */
  public getCurrentUser(): LoginUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Checks if user is authenticated
   */
  public isAuthenticated(): boolean {
    const user = this.currentUserSubject.value;
    const loginId = this.getLoginId();
    return !!(user && loginId !== null);
  }

  /**
   * Logs in a user by verifying credentials against backend /Login/all
   */
  login(name: string, password: string): Observable<LoginUser> {
    const trimmedName = name.trim();

    return this.http.get<LoginUser[]>(`${this.baseUrl}/all`).pipe(
      map(users => {
        // Find matching record in Login table
        const found = users.find(
          u => u.name?.trim().toLowerCase() === trimmedName.toLowerCase() && u.password === password
        );

        if (!found) {
          throw new Error('Invalid username or password. Please verify your credentials or register.');
        }

        const normalizedUser: LoginUser = {
          login_id: this.extractLoginId(found) ?? undefined,
          Login_id: this.extractLoginId(found) ?? undefined,
          name: found.name
        };

        this.setStoredUser(normalizedUser);
        this.currentUserSubject.next(normalizedUser);
        return normalizedUser;
      }),
      catchError(err => {
        console.error('AuthService login error:', err);
        return throwError(() => err instanceof Error ? err : new Error(err.message || 'Login failed'));
      })
    );
  }

  /**
   * Registers a new user into MySQL Login table and auto-logs them in
   */
  signup(name: string, password: string): Observable<LoginUser> {
    const trimmedName = name.trim();

    // 1. First check if username is already taken
    return this.http.get<LoginUser[]>(`${this.baseUrl}/all`).pipe(
      catchError(() => of([] as LoginUser[])), // if empty or first run
      switchMap(existingUsers => {
        const alreadyExists = existingUsers.some(
          u => u.name?.trim().toLowerCase() === trimmedName.toLowerCase()
        );
        if (alreadyExists) {
          return throwError(() => new Error(`The username "${trimmedName}" is already taken. Please choose another.`));
        }

        // 2. Post new user to /Login
        const newRecord = { name: trimmedName, password };
        return this.http.post<void>(this.baseUrl, newRecord).pipe(
          // 3. Fetch /Login/all again to retrieve the generated Login_id
          switchMap(() => this.http.get<LoginUser[]>(`${this.baseUrl}/all`)),
          map(updatedUsers => {
            const created = updatedUsers.find(
              u => u.name?.trim().toLowerCase() === trimmedName.toLowerCase()
            );

            const loginId = created ? this.extractLoginId(created) : 1;
            const authenticatedUser: LoginUser = {
              login_id: loginId ?? undefined,
              Login_id: loginId ?? undefined,
              name: trimmedName
            };

            this.setStoredUser(authenticatedUser);
            this.currentUserSubject.next(authenticatedUser);
            return authenticatedUser;
          })
        );
      }),
      catchError(err => {
        console.error('AuthService signup error:', err);
        return throwError(() => err instanceof Error ? err : new Error(err.message || 'Registration failed'));
      })
    );
  }

  /**
   * Logs out the user, clears storage and redirects to /login
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Stores user session in localStorage
   */
  private setStoredUser(user: LoginUser): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }

  /**
   * Retrieves user session from localStorage or sessionStorage
   */
  private getStoredUser(): LoginUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed parsing stored user', e);
    }
    return null;
  }
}

