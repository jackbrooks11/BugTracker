import { Component, OnInit } from '@angular/core';
import { Ticket } from '../_models/ticket';
import { TicketsService } from '../_services/tickets.service';

@Component({
  selector: 'app-chart-collection',
  templateUrl: './chart-collection.component.html',
  styleUrls: ['./chart-collection.component.css'],
})
export class ChartCollectionComponent implements OnInit {
  tickets: Ticket[];
  constructor(private ticketService: TicketsService) {}

  ngOnInit(): void {
    this.ticketService.getTickets().subscribe((tickets) => {
      this.tickets = tickets;
    });
  }
}
