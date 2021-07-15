import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, pipe } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PaginatedResult } from '../_models/pagination';
import { Ticket } from '../_models/ticket';
import { TicketParams } from '../_models/ticketParams';
import { User } from '../_models/user';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root',
})
export class TicketsService {
  baseUrl = environment.apiUrl;
  tickets: Ticket[] = [];
  ticketsForUser: Ticket[] = [];
  ticketCache = new Map();
  ticketParams: TicketParams;

  constructor(private http: HttpClient) {
      this.ticketParams = new TicketParams();
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

  getTicketsForUser() {
    if (this.ticketsForUser.length > 0) return of(this.ticketsForUser);
    return this.http.get<Ticket[]>(this.baseUrl + 'users/member/tickets').pipe(
      map((tickets) => {
        this.ticketsForUser = tickets;
        return tickets;
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

  getTicketParams() {
    return this.ticketParams;
  }

  setTicketParams(params: TicketParams) {
    this.ticketParams = params;
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
