import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Ticket } from '../_models/ticket';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getTickets() {
    return this.http.get<Ticket[]>(this.baseUrl + 'tickets');
  }

  getTicket(id: number) {
    return this.http.get<Ticket>(this.baseUrl + 'tickets/' + id);  
  }
}
