import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Pagination } from 'src/app/_models/pagination';
import { Ticket } from 'src/app/_models/ticket';
import { TicketParams } from 'src/app/_models/ticketParams';
import { TicketsService } from 'src/app/_services/tickets.service';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css']
})
export class TicketListComponent implements OnInit {
  tickets: Ticket[];
  pagination: Pagination;
  ticketParams: TicketParams = new TicketParams();
  ascending: boolean = false;
  icons: number[] = [0, 0, 0, 0, 0, 0, 0];
  index: number = -1;
  constructor(private ticketService: TicketsService) { }

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(toggle: boolean = false, index: number = this.index) {
    if (index != -1 && toggle) {
      this.changeIcon(index);
    }
    if (this.index != index) {
      this.icons[this.index] = 0;
      this.index = index;
    }
    if (toggle) {
      this.toggleAscending();
    }
    this.ticketParams.ascending = this.ascending;
    console.log(this.ticketParams);
    this.ticketService.getTickets(this.ticketParams).subscribe(response => {
      this.tickets = response.result;
      this.pagination = response.pagination;
    })
  }

  pageChanged(event: any) {
    this.ticketParams.pageNumber = event.page;
    this.loadTickets();
  }

  toggleAscending() {
    if (this.ascending == null){
       this.ascending = false;
    }
    else {
      this.ascending = !this.ascending;
    }
  }

  changeIcon(index: number) {
    if (this.icons[index] == 2) {
      --this.icons[index];
    }
    else {
      ++ this.icons[index];
    }
  }
}
