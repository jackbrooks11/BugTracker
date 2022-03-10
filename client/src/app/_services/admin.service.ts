import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { PaginatedResult } from '../_models/pagination';
import { UserParams } from '../_models/userParams';
import { PaginatedUserDto } from '../_models/paginatedUserDto';
import { ResetPasswordDto } from '../_models/resetPasswordDto';
import { ResetEmailDto } from '../_models/resetEmailDto';
import { SendConfirmationEmailDto } from '../_models/sendConfirmationEmailDto';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  baseUrl = environment.apiUrl;
  users: Partial<User[]> = [];
  userCache = new Map();
  userParams: UserParams;

  constructor(private http: HttpClient) {
    this.userParams = new UserParams();
  }

  getUsersWithRoles(userParams: UserParams) {

    var response = this.userCache.get(Object.values(userParams).join('-'));
    if (response) {
      return of(response);
    }

    let params = this.getPaginationHeaders(
      userParams.pageNumber,
      userParams.pageSize
    );

    params = params.append('orderBy', userParams.orderBy);
    params = params.append('ascending', userParams.ascending);
    params = params.append('searchMatch', userParams.searchMatch);

    return this.getPaginatedResult<PaginatedUserDto[]>(
      this.baseUrl + 'admin/users-with-roles',
      params
    ).pipe(
      map((response) => {
        this.userCache.set(
          Object.values(userParams).join('-'),
          response
        );
        return response;
      })
    );
  }

  updateUserRoles(username: string, roles: string[]) {
    return this.http.post(
      this.baseUrl + 'admin/edit-roles/' + username + '?roles=' + roles,
      {}
    );
  }
  
  resetPassword(model: ResetPasswordDto) {
    return this.http.post(this.baseUrl + 'admin/resetPassword', model);
  }

  resetEmail(model: ResetEmailDto) {
    return this.http.post(this.baseUrl + 'admin/resetEmail', model);
  }

  sendConfirmationEmail(model: SendConfirmationEmailDto) {
    return this.http.post(this.baseUrl + 'admin/sendConfirmationEmail', model);
  }

  createUser(model: any) {
    return this.http.post(this.baseUrl + 'admin/createUser', model).pipe(
      map(() => {
        this.userCache.clear();
      })
    );
  }

  deleteUsers(userIdsToDelete: number[]) {
    return this.http
      .post(this.baseUrl + 'admin/deleteUsers', userIdsToDelete)
      .pipe(
        map(() => {
          this.userCache.clear();
        })
      );
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

  private getPaginationHeaders(pageNumber: number, pageSize: number) {
    let params = new HttpParams();
    params = params.append('pageNumber', pageNumber.toString());
    params = params.append('pageSize', pageSize.toString());

    return params;
  }

  setUserParams(params: UserParams) {
    this.userParams = params;
  }

  getUserParams() {
    return this.userParams;
  }
}
