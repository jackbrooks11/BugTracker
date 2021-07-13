import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PaginatedResult } from '../_models/pagination';
import { Ticket } from '../_models/ticket';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {
  baseUrl = environment.apiUrl;
  tickets: Ticket[] = [];
  ticketsForUser: Ticket[] = [];
  paginatedResult: PaginatedResult<Ticket[]> = new PaginatedResult<Ticket[]>();


  constructor(private http: HttpClient) { }

  getTickets(page?: number, itemsPerPage?: number) {
    //if (this.tickets.length > 0) return of(this.tickets);
    let params = new HttpParams();

    if (page !== null && itemsPerPage !== null) {
      params = params.append('pageNumber', page.toString());
      params = params.append('pageSize', itemsPerPage.toString());
    }
    return this.http.get<Ticket[]>(this.baseUrl + 'tickets', {observe: 'response', params}).pipe(
      map(response => {
        this.paginatedResult.result = response.body;
        if (response.headers.get('Pagination') !== null) {
          this.paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
        }

        return this.paginatedResult;
      })
    );
  }

  getTicketsForUser() {
    if (this.ticketsForUser.length > 0) return of(this.ticketsForUser);

    return this.http.get<Ticket[]>(this.baseUrl + 'users/member/tickets').pipe(
      map(tickets => {
        this.ticketsForUser = tickets;
        return tickets;
      })
    );
  }

  getTicket(id: number) {
    const ticket = this.tickets.find(x => x.id === id);
    if (ticket !== undefined) return of(ticket); 
    return this.http.get<Ticket>(this.baseUrl + 'tickets/' + id);
  }

  updateTicket(ticket: Ticket) {
    return this.http.put(this.baseUrl + 'tickets', ticket).pipe(map(() => {
      const index = this.tickets.indexOf(ticket);
      this.tickets[index] = ticket;
    })
  );
  }
}
