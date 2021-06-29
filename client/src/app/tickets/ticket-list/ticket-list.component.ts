import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Ticket } from 'src/app/_models/ticket';
import { TicketsService } from 'src/app/_services/tickets.service';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css']
})
export class TicketListComponent implements OnInit {
  tickets$: Observable<Ticket[]>;

  constructor(private ticketService: TicketsService) { }

  ngOnInit(): void {
    this.tickets$ = this.ticketService.getTickets();
  }
}
