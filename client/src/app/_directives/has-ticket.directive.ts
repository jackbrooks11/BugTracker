import {
  Directive,
  Input,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { take } from 'rxjs/operators';
import { Ticket } from '../_models/ticket';
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';
import { ProjectUsersService } from '../_services/projectUsers.service';

@Directive({
  selector: '[appHasTicket]',
})
export class HasTicketDirective implements OnInit {
  @Input() appHasTicket: Ticket;
  user: User;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private accountService: AccountService,
    private projectUserService: ProjectUsersService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe((user) => {
      this.user = user;
    });
  }
  ngOnInit(): void {
    //clear view if no roles
    if (!this.user?.roles || this.user == null) {
      this.viewContainerRef.clear();
      return;
    }
    this.projectUserService
      .getUsersForProject(this.appHasTicket.project)
      .subscribe((users) => {
        this.viewContainerRef.clear();
        if (
          (this.user?.roles.includes('Project Manager') &&
            users.includes(this.user.username)) ||
          this.user?.roles.includes('Admin') ||
          (this.user?.roles.includes('Developer') &&
            this.appHasTicket.assignee == this.user.username)
        ) {
          this.viewContainerRef.createEmbeddedView(this.templateRef);
          return;
        }
      });
  }
}
