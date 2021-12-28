import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Ticket } from 'src/app/_models/ticket';
import { TicketsService } from 'src/app/_services/tickets.service';

@Component({
  selector: 'app-ticket-info',
  templateUrl: './ticket-info.component.html',
  styleUrls: ['./ticket-info.component.css']
})
export class TicketInfoComponent implements OnInit {
  ticket: Ticket;

  constructor(
    private ticketService: TicketsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTicket();
  }

  loadTicket() {
    this.ticketService
      .getTicket(Number(this.route.snapshot.paramMap.get('id')))
      .subscribe(
        (ticket) => {
          if (ticket == null) {
            this.router.navigateByUrl('/not-found');
          }
          this.ticket = ticket;
        },
        (error) => {
          console.log(error);
          this.router.navigateByUrl('/not-found');
        }
      );
  }
}