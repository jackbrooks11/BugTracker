import { Component, OnInit } from '@angular/core';
import { Pagination } from 'src/app/_models/pagination';
import { Ticket } from 'src/app/_models/ticket';
import { TicketParams } from 'src/app/_models/ticketParams';

@Component({
  selector: 'app-ticket-history',
  templateUrl: './ticket-history.component.html',
  styleUrls: ['./ticket-history.component.css'],
})
export class TicketHistoryComponent implements OnInit {
  ticketParams: TicketParams = new TicketParams();
  pagination: Pagination;
  tickets: Ticket[];
  headers: string[] = ["Editor", "Property", "Old Value", "New Value", "Edited"];
  constructor() {}

  ngOnInit(): void {}

  loadTickets(
    toggle: boolean = false,
    index: number = this.ticketParams.index
  ) {}
}
