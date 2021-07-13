import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  baseUrl = environment.apiUrl;
  users: Partial<User[]> = [];

  constructor(private http: HttpClient) { }

  getUsersWithRoles() {
    if (this.users.length > 0) return of(this.users);
    return this.http.get<Partial<User[]>>(this.baseUrl + 'admin/users-with-roles').pipe(
      map(users => {
        this.users = users;
        return users;
      })
    );
  }

  updateUserRoles(username: string, roles: string[]) {
    return this.http.post(this.baseUrl + 'admin/edit-roles/' + username + '?roles=' + roles, {});
  }
}
