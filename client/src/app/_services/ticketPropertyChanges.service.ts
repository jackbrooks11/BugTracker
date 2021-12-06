import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PaginatedResult } from '../_models/pagination';
import { TicketPropertyChange } from '../_models/ticketPropertyChange';
import { TicketPropertyChangeParams } from '../_models/ticketPropertyChangeParams';

@Injectable({
  providedIn: 'root',
})
export class TicketPropertyChangesService {
  baseUrl = environment.apiUrl;
  changeCache = new Map();
  ticketPropertyChangeParams: TicketPropertyChangeParams =
    new TicketPropertyChangeParams();
  constructor(private http: HttpClient) {}

  getTicketPropertyChanges(ticketId: number) {
    var response = this.changeCache.get(ticketId);
    if (response) {
      return of(response);
    }
    return this.http
      .get<TicketPropertyChange[]>(this.baseUrl + 'ticketPropertyChanges')
      .pipe(
        map((response) => {
          this.changeCache.set(ticketId, response);
          return response;
        })
      );
  }

  getTicketPropertyChangesPaginated(
    ticketId: number,
    ticketPropertyChangeParams: TicketPropertyChangeParams
  ) {
    var response = this.changeCache.get(
      Object.values(ticketPropertyChangeParams).join('-')
    );
    if (response) {
      return of(response);
    }

    let params = this.getPaginationHeaders(
      ticketPropertyChangeParams.pageNumber,
      ticketPropertyChangeParams.pageSize
    );

    params = params.append('orderBy', ticketPropertyChangeParams.orderBy);
    params = params.append('ascending', ticketPropertyChangeParams.ascending);
    params = params.append(
      'searchMatch',
      ticketPropertyChangeParams.searchMatch
    );
    return this.getPaginatedResult<TicketPropertyChange[]>(
      this.baseUrl + 'ticketPropertyChanges/paginated/' + ticketId,
      params
    ).pipe(
      map((response) => {
        this.changeCache.set(
          Object.values(ticketPropertyChangeParams).join('-'),
          response
        );
        return response;
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

  setTicketPropertyChangeParams(params: TicketPropertyChangeParams) {
    this.ticketPropertyChangeParams = params;
  }

  getTicketPropertyChangeParams() {
    return this.ticketPropertyChangeParams;
  }
}
