import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Ticket } from '../_models/ticket';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {
  baseUrl = environment.apiUrl;
  tickets: Ticket[] = [];

  constructor(private http: HttpClient) { }

  getTickets() {
    if (this.tickets.length > 0) return of(this.tickets);
    
    return this.http.get<Ticket[]>(this.baseUrl + 'tickets').pipe(
      map(tickets => {
        this.tickets = tickets;
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
