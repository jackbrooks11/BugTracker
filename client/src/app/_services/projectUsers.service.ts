import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { PaginatedResult } from '../_models/pagination';
import { Project } from '../_models/project';
import { UserParams } from '../_models/userParams';

@Injectable({
  providedIn: 'root'
})
export class ProjectUsersService {
  baseUrl = environment.apiUrl;

  membersForProject: Member[] = [];
  membersNotInProject: Member[] = [];

  memberForProjectCache = new Map();
  memberNotInProjectCache = new Map();

  memberForProjectParams: UserParams = new UserParams();

  disableLoadMoreUsers: boolean = true;

  constructor(private http: HttpClient) {}

  addUserToProject(projectId: number, username: string) {
    var model: any = {};
    model.projectId = projectId;
    model.username = username;
    return this.http
      .post(this.baseUrl + 'projectUsers/' + projectId + '/addUser', model)
      .pipe(
        map(() => {
          this.memberForProjectCache.clear();
        })
      );
  }

  deleteUsersFromProject(project: Project, usernamesToDelete: string[]) {
    var model: any = {};
    model.project = project;
    model.usernamesToDelete = usernamesToDelete;
    return this.http.post(this.baseUrl + 'projectUsers/' + project.id + '/deleteUsers', model).pipe(
      map(() => {
        this.memberForProjectCache.clear();
      })
    );
  }

  getMembersForProject(projectTitle: string, userParams: UserParams) {
    var response = this.memberForProjectCache.get(
      Object.values(userParams).join('-') + '-' + projectTitle
    );
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

    return this.getPaginatedResult<Member[]>(
      this.baseUrl + 'projectUsers/' + projectTitle + '/users',
      params
    ).pipe(
      map((response) => {
        this.memberForProjectCache.set(
          Object.values(userParams).join('-') + '-' + projectTitle,
          response
        );
        return response;
      })
    );
  }

  getMembersNotInProject(projectTitle: string, userParams: UserParams) {
    var response = this.memberNotInProjectCache.get(
      Object.values(userParams).join('-') + '-' + projectTitle
    );
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

    return this.getPaginatedResult<Member[]>(
      this.baseUrl + 'projectUsers/' + projectTitle + '/usersNotInProject',
      params
    ).pipe(
      map((response) => {
        this.memberForProjectCache.set(
          Object.values(userParams).join('-') + '-' + projectTitle,
          response
        );
        return response;
      })
    );
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
