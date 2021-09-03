import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Ticket } from 'src/app/_models/ticket';
import { TicketsService } from 'src/app/_services/tickets.service';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.css']
})
export class TicketDetailComponent implements OnInit {
  ticket: Ticket;

  constructor(private ticketService: TicketsService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.loadTicket();
  }

  loadTicket() {
    this.ticketService.getTicket(Number(this.route.snapshot.paramMap.get('id'))).
    subscribe(ticket => {
      if (ticket == null) {
        this.router.navigateByUrl('/not-found')
      }
      this.ticket = ticket;
    }, error => {
      this.router.navigateByUrl('/not-found');
    })
  }
}
