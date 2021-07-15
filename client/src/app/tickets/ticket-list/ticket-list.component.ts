import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { Pagination } from 'src/app/_models/pagination';
import { Ticket } from 'src/app/_models/ticket';
import { TicketParams } from 'src/app/_models/ticketParams';
import { AccountService } from 'src/app/_services/account.service';
import { TicketsService } from 'src/app/_services/tickets.service';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css']
})
export class TicketListComponent implements OnInit {
  tickets: Ticket[];
  pagination: Pagination;
  ticketParams: TicketParams;

  constructor(private ticketService: TicketsService) {
    this.ticketParams = this.ticketService.getTicketParams();
   }

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(toggle: boolean = false, index: number = this.ticketParams.index) {
    if (toggle) {
      this.changeIcon(index);
      //New column has been clicked
      if (this.ticketParams.index != index) {
        this.ticketParams.icons[this.ticketParams.index] = 0;
        this.ticketParams.index = index;
        this.ticketParams.ascending = true;
      }
      else {
        this.toggleAscending();
      }
    }
    console.log(this.ticketParams);
    this.ticketService.setTicketParams(this.ticketParams);
    this.ticketService.getTickets(this.ticketParams).subscribe(response => {
      this.tickets = response.result;
      this.pagination = response.pagination;
    })
  }

  pageChanged(event: any) {
    this.ticketParams.pageNumber = event.page;
    this.ticketService.setTicketParams(this.ticketParams);
    this.loadTickets();
  }

  toggleAscending() {
    this.ticketParams.ascending = !this.ticketParams.ascending;
  }

  changeIcon(index: number) {
    if (this.ticketParams.icons[index] == 2) {
      -- this.ticketParams.icons[index];
    }
    else {
      ++ this.ticketParams.icons[index];
    }
  }
}
