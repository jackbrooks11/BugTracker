import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { EditUserDto } from '../_models/editUserDto';
import { User } from '../_models/user';
import { LoggedInUser } from '../_models/loggedInUser';
import { ForgotPasswordDto } from '../_models/forgotPasswordDto';
import { ResetPasswordDto } from '../_models/resetPasswordDto';
import { RegisterDto } from '../_models/registerDto';
import { ConfirmEmailDto } from '../_models/confirmEmailDto';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private currentUserSource = new ReplaySubject<LoggedInUser>(1);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient) { }

  login(model: any) {
    return this.http.post(this.baseUrl + 'account/login', model).pipe(
      map((response: LoggedInUser) => {
        const loggedInUser = response;
        if (loggedInUser) {
          this.setCurrentUser(loggedInUser);
        }
      })
    )
  }

  loginAsDemo() {
    return this.http.get(this.baseUrl + 'account/loginAsDemo').pipe(
      map((response: LoggedInUser) => {
        const loggedInUser = response;
        if (loggedInUser) {
          this.setCurrentUser(loggedInUser);
        }
      })
    )
  }
  register(model: RegisterDto) {
    return this.http.post(this.baseUrl + 'account/register', model);
  }

  forgotPassword(model: ForgotPasswordDto) {
    return this.http.post(this.baseUrl + 'account/forgotPassword', model);
  }

  resetPassword(model: ResetPasswordDto) {
    return this.http.post(this.baseUrl + 'account/resetPassword', model);
  }

  confirmEmail(model: ConfirmEmailDto) {
    console.log(model);
    return this.http.post(this.baseUrl + 'account/confirmEmail', model);
  }

  setCurrentUser(loggedInUser: LoggedInUser) {
    loggedInUser.roles = [];
    const roles = this.getDecodedToken(loggedInUser.token).role;
    Array.isArray(roles) ? loggedInUser.roles = roles : loggedInUser.roles.push(roles);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    this.currentUserSource.next(loggedInUser);
    document.body.style.background = 'rgba(0, 0, 0, 0)';
  }

  updateUser(editUser: EditUserDto) {
    return this.http.put(this.baseUrl + 'account', editUser).pipe(
      map((user: User) => {
        return user;
      })
    );
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
    document.body.style.background = 'rgba(0, 0, 0, 0.8)';
  }

  getDecodedToken(token: any) {
    return JSON.parse(atob(token.split('.')[1]));
  }


}
