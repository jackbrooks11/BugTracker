import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Ticket } from 'src/app/_models/ticket';
import { TicketsService } from 'src/app/_services/tickets.service';

@Component({
  selector: 'app-member-tickets',
  templateUrl: './member-tickets.component.html',
  styleUrls: ['./member-tickets.component.css']
})
export class MemberTicketsComponent implements OnInit {
  tickets$: Observable<Ticket[]>;

  constructor(private ticketService: TicketsService) { }

  ngOnInit(): void {
    this.tickets$ = this.ticketService.getTicketsForUser();
  }

}
