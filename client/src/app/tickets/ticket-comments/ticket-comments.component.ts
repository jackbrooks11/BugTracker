import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { TicketComment } from 'src/app/_models/ticketComment';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
import { TicketsService } from 'src/app/_services/tickets.service';

@Component({
  selector: 'app-ticket-comments',
  templateUrl: './ticket-comments.component.html',
  styleUrls: ['./ticket-comments.component.css'],
})
export class TicketCommentsComponent implements OnInit {
  ticketId: number;
  commentForm: FormGroup;
  comments: TicketComment[];
  message: string = '';
  user: User;
  @HostListener('window:beforeunload', ['$event']) unloadNotifcation(
    $event: any
  ) {
    if (this.commentForm.dirty) {
      $event.returnValue = true;
    }
  }

  constructor(
    private ticketService: TicketsService,
    private accountService: AccountService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.user = user));
  }

  initializeForm() {
    this.commentForm = this.fb.group({
      message: [this.message],
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadTicket();
  }

  loadTicket() {
    this.ticketService
      .getTicket(Number(this.route.snapshot.paramMap.get('id')))
      .subscribe((ticket) => {
        this.ticketId = ticket.id;
        this.comments = ticket.comments;
      });
  }

  createComment() {
    var comment: TicketComment = Object();
    comment.message = this.commentForm.controls.message.value;
    comment.ticketId = this.ticketId;
    comment.submittedBy = this.user.username;
    console.log(comment);
    this.ticketService
      .addCommentToTicket(comment, this.ticketId)
      .subscribe(() => {
        this.loadTicket();
        this.initializeForm();
      });
  }
}
