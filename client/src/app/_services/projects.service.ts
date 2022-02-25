import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PaginatedResult } from '../_models/pagination';
import { Project } from '../_models/project';
import { ProjectParams } from '../_models/projectParams';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  baseUrl = environment.apiUrl;
  projects: Project[];
  projectsForUser: Project[] = [];
  projectCache = new Map();
  projectForUserCache = new Map();
  projectParams: ProjectParams;
  projectForUserParams: ProjectParams;
  disableLoadMoreProjects: boolean = true;

  constructor(private http: HttpClient) {
    this.projectParams = new ProjectParams();
    this.projectForUserParams = new ProjectParams();
  }

  getProjects() {
    if (this.projects) {
      return of(this.projects);
    }
    return this.http.get<Project[]>(this.baseUrl + 'projects').pipe(
      map((response) => {
        this.projects = response;
        return response;
      })
    );
  }

  getProjectsPaginated(projectParams: ProjectParams) {
    var response = this.projectCache.get(
      Object.values(projectParams).join('-')
    );
    if (response) {
      return of(response);
    }

    let params = this.getPaginationHeaders(
      projectParams.pageNumber,
      projectParams.pageSize
    );

    params = params.append('orderBy', projectParams.orderBy);
    params = params.append('ascending', projectParams.ascending);
    params = params.append('searchMatch', projectParams.searchMatch);
    return this.getPaginatedResult<Project[]>(
      this.baseUrl + 'projects/paginated',
      params
    ).pipe(
      map((response) => {
        this.projectCache.set(Object.values(projectParams).join('-'), response);
        return response;
      })
    );
  }

  getProjectById(id: number) {
    var project = [...this.projectCache.values()]
      .reduce((arr, elem) => arr.concat(elem.result), [])
      .find((project: Project) => project.id === id);
    if (project) {
      return of(project);
    }
    project = [...this.projectForUserCache.values()]
      .reduce((arr, elem) => arr.concat(elem.result), [])
      .find((project: Project) => project.id === id);
    if (project) {
      return of(project);
    }
    return this.http.get<Project>(this.baseUrl + 'projects/' + id);
  }

  getProjectsForUser(projectParams: ProjectParams) {
    var response = this.projectForUserCache.get(
      Object.values(projectParams).join('-')
    );
    if (response) {
      return of(response);
    }

    let params = this.getPaginationHeaders(
      projectParams.pageNumber,
      projectParams.pageSize
    );

    params = params.append('orderBy', projectParams.orderBy);
    params = params.append('ascending', projectParams.ascending);
    params = params.append('searchMatch', projectParams.searchMatch);

    return this.getPaginatedResult<Project[]>(
      this.baseUrl + 'projects/user/projects',
      params
    ).pipe(
      map((response) => {
        this.projectForUserCache.set(
          Object.values(projectParams).join('-'),
          response
        );
        return response;
      })
    );
  }

  createProject(project: any) {
    return this.http.post(this.baseUrl + 'projects/create', project).pipe(
      map(() => {
        this.projectCache.clear();
      })
    );
  }

  updateProject(project: Project) {
    return this.http.put(this.baseUrl + 'projects', project).pipe(
      map(() => {
        this.projectCache.clear();
      })
    );
  }

  deleteProjects(projectIdsToDelete: number[]) {
    return this.http
      .post(this.baseUrl + 'projects/delete', projectIdsToDelete)
      .pipe(
        map(() => {
          this.projectCache.clear();
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

  getProjectParams() {
    return this.projectParams;
  }

  setProjectParams(params: ProjectParams) {
    this.projectParams = params;
  }

  getProjectForUserParams() {
    return this.projectForUserParams;
  }

  setProjectForUserParams(params: ProjectParams) {
    this.projectForUserParams = params;
  }
}
