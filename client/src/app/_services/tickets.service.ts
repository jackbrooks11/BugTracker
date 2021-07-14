import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PaginatedResult } from '../_models/pagination';
import { Ticket } from '../_models/ticket';
import { TicketParams } from '../_models/ticketParams';

@Injectable({
  providedIn: 'root',
})
export class TicketsService {
  baseUrl = environment.apiUrl;
  tickets: Ticket[] = [];
  ticketsForUser: Ticket[] = [];

  constructor(private http: HttpClient) {}

  getTickets(ticketParams: TicketParams) {
    //if (this.tickets.length > 0) return of(this.tickets);
    let params = this.getPaginationHeaders(
      ticketParams.pageNumber,
      ticketParams.pageSize
    );

    params = params.append('orderBy', ticketParams.orderBy);
    params = params.append('ascending', ticketParams.ascending);
    params = params.append('searchMatch', ticketParams.searchMatch);
    return this.getPaginatedResult<Ticket[]>(this.baseUrl + 'tickets', params);
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
    const ticket = this.tickets.find((x) => x.id === id);
    if (ticket !== undefined) return of(ticket);
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
