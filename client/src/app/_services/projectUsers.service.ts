import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { PaginatedResult } from '../_models/pagination';
import { Project } from '../_models/project';
import { UserParams } from '../_models/userParams';

@Injectable({
  providedIn: 'root',
})
export class ProjectUsersService {
  baseUrl = environment.apiUrl;

  projectsForUserCache = new Map();
  userForProjectCache = new Map();
  userNotInProjectCache = new Map();

  disableLoadMoreUsers: boolean = true;
  disableLoadMoreProjects: boolean = true;

  constructor(private http: HttpClient) {}


  addUserToProject(projectId: number, username: string) {
    var model: any = {};
    model.projectId = projectId;
    model.username = username;
    return this.http
      .post(this.baseUrl + 'projectUsers/' + projectId + '/addUser', model)
      .pipe(
        map(() => {
          this.userForProjectCache.clear();
        })
      );
  }

  deleteUsersFromProject(project: Project, usernamesToDelete: string[]) {
    var model: any = {};
    model.project = project;
    model.usernamesToDelete = usernamesToDelete;
    return this.http
      .post(this.baseUrl + 'projectUsers/' + project.id + '/deleteUsers', model)
      .pipe(
        map(() => {
          this.userForProjectCache.clear();
        })
      );
  }

  getUsersForProjectPaginated(userParams: UserParams, projectTitle: string) {
    var response = this.userForProjectCache.get(
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

    return this.getPaginatedResult<User[]>(
      this.baseUrl + 'projectUsers/' + projectTitle + '/usersPaginated',
      params
    ).pipe(
      map((response) => {
        this.userForProjectCache.set(
          Object.values(userParams).join('-') + '-' + projectTitle,
          response
        );
        return response;
      })
    );
  }

  getUsersNotInProject(projectTitle: string) {
    var response = this.userNotInProjectCache.get(
      projectTitle
    );
    if (response) {
      return of(response);
    }

    return this.http.get<User[]>(
      this.baseUrl +
      'projectUsers/' +
      projectTitle +
      '/usersNotInProject'
    ).pipe(
      map((response) => {
        this.userNotInProjectCache.set(projectTitle, response);
        return response;
      })
    );
  }

  getProjectsForUser(username: string) {
    var response = this.projectsForUserCache.get(
      username
    );
    if (response) {
      return of(response);
    }

    return this.http.get<Project[]>(
      this.baseUrl + 'projectUsers/' + username + '/projects'
    ).pipe(
      map((response) => {
        this.projectsForUserCache.set(
          username, response
        );
        return response;
      })
    );
  }

  getUsersForProject(projectTitle: string) {
    var response = this.userForProjectCache.get(
      projectTitle
    );
    if (response) {
      return of(response);
    }

    return this.http.get<User[]>(
      this.baseUrl + 'projectUsers/' + projectTitle + '/users'
    ).pipe(
      map((response) => {
        this.userForProjectCache.set(
          projectTitle, response
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
