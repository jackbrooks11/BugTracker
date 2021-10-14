import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { EditMemberDto } from '../_models/editMemberDto';
import { Member } from '../_models/member';
import { PaginatedResult } from '../_models/pagination';
import { Project } from '../_models/project';
import { ProjectUserDto } from '../_models/projectUserDto';
import { User } from '../_models/user';
import { UserParams } from '../_models/userParams';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members: Member[] = [];
  membersForProject: Member[] = [];
  membersNotInProject: Member[] = [];
  memberCache = new Map();
  memberForProjectCache = new Map();
  memberNotInProjectCache = new Map();
  userParams: UserParams;
  userForProjectParams: UserParams;
  disableLoadMoreUsers: boolean = false;
  paginatedResult: PaginatedResult<Member[]> = new PaginatedResult<Member[]>();

  constructor(private http: HttpClient) {
    this.userParams = new UserParams();
    this.userForProjectParams = new UserParams();
  }

  getMembers(userParams: UserParams) {
    var response = this.memberCache.get(Object.values(userParams).join('-'));
    if (response) {
      return of(response);
    }

    let params = new HttpParams();

    params = params.append('searchMatch', userParams.searchMatch);
    return this.getPaginatedResult<Member[]>(
      this.baseUrl + 'users',
      params
    ).pipe(
      map((response) => {
        this.memberCache.set(Object.values(userParams).join('-'), response);
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
      this.baseUrl + 'users/' + projectTitle + '/usersNotInProject',
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
      this.baseUrl + 'users/' + projectTitle + '/users',
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

  addUserToProject(projectId: number, username: string) {
    var model: any = {};
    model.projectId = projectId;
    model.username = username;
    return this.http
      .post(this.baseUrl + 'users/' + projectId + '/addUser', model)
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
    return this.http.post(this.baseUrl + 'users/' + project.id + '/deleteUsers', model).pipe(
      map(() => {
        this.memberForProjectCache.clear();
      })
    );
  }
  getMember(username: string) {
    const member = this.members.find((x) => x.userName === username);
    if (member !== undefined) return of(member);
    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  getMemberRoles(username: string) {
    return this.http.get<Partial<User>>(
      this.baseUrl + 'users/' + username + '/roles'
    );
  }

  updateMember(editMember: EditMemberDto) {
    return this.http.put(this.baseUrl + 'users', editMember).pipe(
      map((member: Member) => {
        const index = this.members.indexOf(member);
        this.members[index] = member;
        return member;
      })
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
