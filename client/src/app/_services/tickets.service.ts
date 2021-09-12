import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PaginatedResult } from '../_models/pagination';
import { Ticket } from '../_models/ticket';
import { TicketForProjectParams } from '../_models/ticketForProjectParams';
import { TicketParams } from '../_models/ticketParams';

@Injectable({
  providedIn: 'root',
})
export class TicketsService {
  baseUrl = environment.apiUrl;
  tickets: Ticket[] = [];
  ticketsForUser: Ticket[] = [];
  ticketCache = new Map();
  ticketForUserCache = new Map();
  ticketForProjectCache = new Map();
  ticketParams: TicketParams;
  ticketForUserParams: TicketParams;
  ticketForProjectParams: TicketForProjectParams;

  constructor(private http: HttpClient) {
    this.ticketParams = new TicketParams();
    this.ticketForUserParams = new TicketParams();
    this.ticketForProjectParams = new TicketParams();
  }

  getTickets(ticketParams: TicketParams) {
    var response = this.ticketCache.get(Object.values(ticketParams).join('-'));
    if (response) {
      return of(response);
    }

    let params = this.getPaginationHeaders(
      ticketParams.pageNumber,
      ticketParams.pageSize
    );

    params = params.append('orderBy', ticketParams.orderBy);
    params = params.append('ascending', ticketParams.ascending);
    params = params.append('searchMatch', ticketParams.searchMatch);
    return this.getPaginatedResult<Ticket[]>(
      this.baseUrl + 'tickets',
      params
    ).pipe(
      map((response) => {
        this.ticketCache.set(Object.values(ticketParams).join('-'), response);
        return response;
      })
    );
  }

  getTicketsForUser(ticketParams: TicketParams) {
    var response = this.ticketForUserCache.get(
      Object.values(ticketParams).join('-')
    );
    if (response) {
      return of(response);
    }

    let params = this.getPaginationHeaders(
      ticketParams.pageNumber,
      ticketParams.pageSize
    );

    params = params.append('orderBy', ticketParams.orderBy);
    params = params.append('ascending', ticketParams.ascending);
    params = params.append('searchMatch', ticketParams.searchMatch);

    return this.getPaginatedResult<Ticket[]>(
      this.baseUrl + 'tickets/member/tickets',
      params
    ).pipe(
      map((response) => {
        this.ticketForUserCache.set(
          Object.values(ticketParams).join('-'),
          response
        );
        return response;
      })
    );
  }

  getTicketsForProject(projectTitle: string, ticketParams: TicketForProjectParams) {
    var response = this.ticketForProjectCache.get(
      Object.values(ticketParams).join('-') + '-' + projectTitle
    );
    if (response) {
      return of(response);
    }

    let params = this.getPaginationHeaders(
      ticketParams.pageNumber,
      ticketParams.pageSize
    );

    params = params.append('orderBy', ticketParams.orderBy);
    params = params.append('ascending', ticketParams.ascending);
    params = params.append('searchMatch', ticketParams.searchMatch);

    return this.getPaginatedResult<Ticket[]>(
      this.baseUrl + 'tickets/' + projectTitle + '/tickets',
      params
    ).pipe(
      map((response) => {
        this.ticketForProjectCache.set(
          Object.values(ticketParams).join('-') + '-' + projectTitle,
          response
        );
        return response;
      })
    );
  }

  getTicket(id: number) {
    const ticket = [...this.ticketCache.values()]
      .reduce((arr, elem) => arr.concat(elem.result), [])
      .find((ticket: Ticket) => ticket.id === id);
    if (ticket) {
      return of(ticket);
    }
    return this.http.get<Ticket>(this.baseUrl + 'tickets/' + id);
  }

  updateTicket(ticket: Ticket) {
    return this.http.put(this.baseUrl + 'tickets', ticket).pipe(
      map(() => {
        const index = this.tickets.indexOf(ticket);
        this.tickets[index] = ticket;
      })
    );
  }

  createTicket(model: any) {
    return this.http.post(this.baseUrl + 'tickets/create', model).pipe(
      map((ticket: Ticket) => {
        const index = this.tickets.indexOf(ticket);
        this.tickets[index] = ticket;
        this.ticketCache.clear();
      })
    );
  }

  deleteTickets(ticketIdsToDelete: number[]) {
    return this.http
      .post(this.baseUrl + 'tickets/delete', ticketIdsToDelete)
      .pipe(
        map((ticket: Ticket) => {
          const index = this.tickets.indexOf(ticket);
          this.tickets[index] = ticket;
          this.ticketCache.clear();
        })
      );
  }

  getTicketParams() {
    return this.ticketParams;
  }

  setTicketParams(params: TicketParams) {
    this.ticketParams = params;
  }

  getTicketForUserParams() {
    return this.ticketForUserParams;
  }

  setTicketForUserParams(params: TicketParams) {
    this.ticketForUserParams = params;
  }

  getTicketForProjectParams() {
    return this.ticketForProjectParams;
  }

  setTicketForProjectParams(params: TicketParams) {
    this.ticketForProjectParams = params;
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
}
