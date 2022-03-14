import { Component, OnInit } from '@angular/core';
import { Pagination } from 'src/app/_models/pagination';
import { Ticket } from 'src/app/_models/ticket';
import { TicketParams } from 'src/app/_models/ticketParams';
import { TicketsService } from 'src/app/_services/tickets.service';

@Component({
  selector: 'app-user-tickets',
  templateUrl: './user-tickets.component.html',
  styleUrls: ['./user-tickets.component.css'],
})
export class UserTicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  pagination: Pagination;
  ticketParams: TicketParams = new TicketParams();
  headers: string[] = ["Title", "Project", "Assignee", "Priority", "State", "Type", "Created"];

  constructor(private ticketService: TicketsService) {
    this.ticketParams = this.ticketService.getTicketForUserParams();
  }

  ngOnInit(): void {
    this.loadTickets();
  }

  updateTable(toggle: boolean, index: number) {
    if (toggle) {
      this.changeIcon(index);
      //New column has been clicked
      if (this.ticketParams.index != index) {
        //Set old icon to double arrows
        this.ticketParams.icons[this.ticketParams.index] = 0;
        //New index for column clicked
        this.ticketParams.index = index;
        this.ticketParams.ascending = true;
      }
      //Still on same column
      else {
        this.toggleAscending();
      }
    }
    this.ticketParams.searchMatch = this.ticketParams.searchMatch.toLowerCase();
    this.ticketService.setTicketForUserParams(this.ticketParams);
  }

  loadTickets(
    toggle: boolean = false,
    index: number = this.ticketParams.index
  ) {
    this.updateTable(toggle, index);
    this.ticketService
      .getTicketsForUser(this.ticketParams)
      .subscribe((response) => {
        console.log("AY");
        this.tickets = response.result;
        this.pagination = response.pagination;
      });
  }

  pageChanged(event: any) {
    this.ticketParams.pageNumber = event.page;
    this.ticketService.setTicketForUserParams(this.ticketParams);
    this.loadTickets();
  }

  toggleAscending() {
    this.ticketParams.ascending = !this.ticketParams.ascending;
  }

  changeIcon(index: number) {
    if (this.ticketParams.icons[index] == 2) {
      --this.ticketParams.icons[index];
    } else {
      ++this.ticketParams.icons[index];
    }
  }
}
