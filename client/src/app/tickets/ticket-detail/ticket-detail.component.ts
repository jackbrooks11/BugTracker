import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Ticket } from 'src/app/_models/ticket';
import { TicketsService } from 'src/app/_services/tickets.service';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.css']
})
export class TicketDetailComponent implements OnInit {
  ticket: Ticket;

  constructor(private ticketService: TicketsService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.loadTicket();
  }

  loadTicket() {
    this.ticketService.getTicket(Number(this.route.snapshot.paramMap.get('id'))).
    subscribe(ticket => {
      this.ticket = ticket;
      console.log(ticket);
    })
  }
}
