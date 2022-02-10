import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { PaginatedResult } from '../_models/pagination';
import { UserParams } from '../_models/userParams';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  baseUrl = environment.apiUrl;
  users: User[] = [];
  userCache = new Map();
  userParams: UserParams;
  paginatedResult: PaginatedResult<User[]> = new PaginatedResult<User[]>();

  constructor(private http: HttpClient) {
    this.userParams = new UserParams();
  }

  getMembers(userParams: UserParams) {
    var response = this.userCache.get(Object.values(userParams).join('-'));
    if (response) {
      return of(response);
    }

    let params = new HttpParams();

    params = params.append('searchMatch', userParams.searchMatch);
    return this.getPaginatedResult<User[]>(
      this.baseUrl + 'users',
      params
    ).pipe(
      map((response) => {
        this.userCache.set(Object.values(userParams).join('-'), response);
        return response;
      })
    );
  }

  getUser(username: string) {
    const member = this.users.find((x) => x.userName === username);
    if (member !== undefined) return of(member);
    return this.http.get<User>(this.baseUrl + 'users/' + username);
  }

  getUserRoles(username: string) {
    return this.http.get<Partial<User>>(
      this.baseUrl + 'users/' + username + '/roles'
    );
  }

  getUserParams() {
    return this.userParams;
  }

  setUserParams(params: UserParams) {
    this.userParams = params;
  }

  private getPaginationHeaders(pageNumber: number, pageSize: number) {
    let params = new HttpParams();
    params = params.append('pageNumber', pageNumber.toString());
    params = params.append('pageSize', pageSize.toString());

    return params;
  }

  private getPaginatedResult<T>(url, params) {
    const paginatedResult: PaginatedResult<T> = new PaginatedResult<T>();
    return this.http.get<T>(url, { observe: 'response', params }).pipe(
      map((response) => {
        paginatedResult.result = response.body;
        if (response.headers.get('Pagination') !== null) {
          paginatedResult.pagination = JSON.parse(
            response.headers.get('Pagination')
          );
        }
        return paginatedResult;
      })
    );
  }
}
