import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TicketModalComponent } from 'src/app/modals/ticket-modal/ticket-modal.component';
import { Pagination } from 'src/app/_models/pagination';
import { Ticket } from 'src/app/_models/ticket';
import { TicketParams } from 'src/app/_models/ticketParams';
import { TicketsService } from 'src/app/_services/tickets.service';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css'],
})
export class TicketListComponent implements OnInit {
  tickets: Ticket[];
  pagination: Pagination;
  ticketParams: TicketParams;
  bsModalRef: BsModalRef;
  checkAll: boolean = false;
  ticketIdsToDelete: number[] = [];
  headers: string[] = ["Title", "Project Name", "Assignee", "Priority", "State", "Type", "Created"]

  constructor(
    private ticketService: TicketsService,
    private modalService: BsModalService
  ) {
    this.ticketParams = this.ticketService.getTicketParams();
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
    this.ticketService.setTicketParams(this.ticketParams);
  }

  loadTickets(
    toggle: boolean = false,
    index: number = this.ticketParams.index
  ) {
    this.updateTable(toggle, index);
    this.ticketService.getTickets(this.ticketParams).subscribe((response) => {
      this.tickets = response.result;
      this.pagination = response.pagination;
      if (this.checkAll) {
        this.ticketIdsToDelete = [];
        this.tickets.forEach((val) => this.ticketIdsToDelete.push(val.id));
      }
    });
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
      --this.ticketParams.icons[index];
    } else {
      ++this.ticketParams.icons[index];
    }
  }

  openRolesModal() {
    const config = {
      class: 'modal-dialog-centered',
    };
    this.bsModalRef = this.modalService.show(TicketModalComponent, config);
    this.bsModalRef.content.submitted.subscribe((value) => {
      const submitted = value;
      if (submitted) {
        this.createTicket();
      }
    });
  }

  createTicket() {
    this.ticketService
      .createTicket(this.bsModalRef.content.createTicketForm.value)
      .subscribe(response => {
        this.loadTickets();
      });
  }

  deleteTickets() {
    if(confirm("Are you sure to delete the selected ticket(s)?")) {
      this.ticketService
      .deleteTickets(this.ticketIdsToDelete)
      .subscribe(response => {
        this.ticketIdsToDelete = [];
        this.loadTickets();
      });
    }
  }

  toggleCheckAll = (evt) => {
    this.checkAll = !this.checkAll;
    if (evt.target.checked == true) {
      this.tickets.forEach((val) => this.ticketIdsToDelete.push(val.id));
    } else {
      this.ticketIdsToDelete.length = 0;
    }
  }

  changed = (evt, id: number) => {
    if (evt.target.checked == true) {
      this.ticketIdsToDelete.push(id);
    } else {
      this.ticketIdsToDelete.splice(this.ticketIdsToDelete.indexOf(id), 1);
    }
  }

}
