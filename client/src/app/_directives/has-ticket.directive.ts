import {
  Directive,
  Input,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { take } from 'rxjs/operators';
import { Ticket } from '../_models/ticket';
import { LoggedInUser } from '../_models/loggedInUser';
import { AccountService } from '../_services/account.service';
import { ProjectUsersService } from '../_services/projectUsers.service';

@Directive({
  selector: '[appHasTicket]',
})
export class HasTicketDirective implements OnInit {
  @Input() appHasTicket: Ticket;
  loggedInUser: LoggedInUser;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private accountService: AccountService,
    private projectUserService: ProjectUsersService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe((loggedInUser) => {
      this.loggedInUser = loggedInUser;
    });
  }
  ngOnInit(): void {
    //clear view if no roles
    if (!this.loggedInUser?.roles || this.loggedInUser == null) {
      this.viewContainerRef.clear();
      return;
    }
    this.projectUserService
      .getUsersForProject(this.appHasTicket.project)
      .subscribe((users) => {
        this.viewContainerRef.clear();
        if (
          (this.loggedInUser?.roles.includes('Project Manager') &&
            users.includes(this.loggedInUser.username)) ||
          this.loggedInUser?.roles.includes('Admin') ||
          (this.loggedInUser?.roles.includes('Developer') &&
            this.appHasTicket.assignee == this.loggedInUser.username)
        ) {
          this.viewContainerRef.createEmbeddedView(this.templateRef);
          return;
        }
      });
  }
}
