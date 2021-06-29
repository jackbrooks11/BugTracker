import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Ticket } from 'src/app/_models/ticket';
import { TicketsService } from 'src/app/_services/tickets.service';

@Component({
  selector: 'app-ticket-edit',
  templateUrl: './ticket-edit.component.html',
  styleUrls: ['./ticket-edit.component.css']
})
export class TicketEditComponent implements OnInit {
  @ViewChild('editForm') editForm: NgForm;
  ticket: Ticket;
  @HostListener('window:beforeunload', ['$event']) unloadNotifcation($event: any) {
    if (this.editForm.dirty) {
      $event.returnValue = true;
    }
  }

  constructor(private ticketService: TicketsService, private route: ActivatedRoute,
    private toastr: ToastrService) { }

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

  updateTicket() {
    this.ticketService.updateTicket(this.ticket).subscribe(() => {
      this.toastr.success('Ticket updated successfully');
      this.editForm.reset(this.ticket);
    })
  }

}
