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
  checkAll: boolean = false;
  commentForm: FormGroup;
  comments: TicketComment[];
  commentIdsToDelete: number[] = [];
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
    comment.roles = this.user.roles.flat().toString();
    this.ticketService
      .addCommentToTicket(comment, this.ticketId)
      .subscribe(() => {
        this.loadTicket();
        this.commentForm.reset();
        this.initializeForm();
      });
  }

  deleteComments() {
    if(confirm("Are you sure to delete the selected comment(s)?")) {
      this.ticketService
      .deleteCommentFromTicket(this.commentIdsToDelete, this.ticketId)
      .subscribe((value) => {
        this.commentIdsToDelete = [];
        this.loadTicket();
      });
    }
  }


  toggleCheckAll = (evt) => {
    this.checkAll = !this.checkAll;
    if (evt.target.checked == true) {
      this.comments.forEach((val) => this.commentIdsToDelete.push(val.id));
    } else {
      this.commentIdsToDelete.length = 0;
    }
  }

  deleteClicked = (evt, id: number) => {
    this.commentIdsToDelete.push(id);
  }

  changed = (evt, id: number) => {
    if (evt.target.checked == true) {
      this.commentIdsToDelete.push(id);
    } else {
      this.commentIdsToDelete.splice(this.commentIdsToDelete.indexOf(id), 1);
    }
  }
}
