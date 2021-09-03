import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { PaginatedResult } from '../_models/pagination';
import { User } from '../_models/user';
import { UserParams } from '../_models/userParams';


@Injectable({
  providedIn: 'root'
})

export class MembersService {
  baseUrl = environment.apiUrl;
  members: Member[] = [];
  membersForProject: Member[] = [];
  memberCache = new Map();
  memberForProjectCache = new Map();
  userParams: UserParams;
  userForProjectParams: UserParams;
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
      }))
  }

  getMembersForProject(projectTitle: string, userParams: UserParams) {
    var response = this.memberForProjectCache.get(projectTitle);
    if (response) {
      return of(response);
    }  

    let params = new HttpParams();

    params = params.append('searchMatch', userParams.searchMatch);

    return this.getPaginatedResult<Member[]>(
      this.baseUrl + 'users/' + projectTitle + '/users',
      params
    ).pipe(
      map((response) => {
        this.memberForProjectCache.set(projectTitle, response);
        return response;
      }))
  }

  getMember(username: string) {
    const member = this.members.find(x => x.userName === username);
    if (member !== undefined) return of(member); 
    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  getMemberRoles(username: string) {
    return this.http.get<Partial<User>>(this.baseUrl + 'users/' + username + '/roles');
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member).pipe(map(() => {
      const index = this.members.indexOf(member);
      this.members[index] = member;
      })
    );
  }

  getUserParams() {
    return this.userParams;
  }

  setUserParams(params: UserParams) {
    this.userParams = params;
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
