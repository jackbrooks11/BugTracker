import { Injectable } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { concatMap, map, switchMap, take } from 'rxjs/operators';
import { Ticket } from '../_models/ticket';
import { LoggedInUser } from '../_models/loggedInUser';
import { AccountService } from '../_services/account.service';
import { ProjectUsersService } from '../_services/projectUsers.service';
import { TicketsService } from '../_services/tickets.service';

@Injectable({
  providedIn: 'root',
})
export class HasTicketGuard implements CanActivate {
  loggedInUser: LoggedInUser;

  constructor(
    private accountService: AccountService,
    private ticketService: TicketsService,
    private projectUserService: ProjectUsersService,
    private toastr: ToastrService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe((loggedInUser) => {
      this.loggedInUser = loggedInUser;
    });
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.ticketService
      .getTicket(Number(route.paramMap.get('id')))
      .pipe(
        switchMap((ticket: Ticket) =>
          this.projectUserService
            .getUsersForProject(ticket.project)
            .pipe(map((users) => [ticket, users]))
        )
      )
      .pipe(
        map((finalData) => {
          if (
            (this.loggedInUser?.roles.includes('Project Manager') &&
              finalData[1].includes(this.loggedInUser.username)) ||
            this.loggedInUser?.roles.includes('Admin') ||
            (this.loggedInUser?.roles.includes('Developer') &&
              finalData[0].assignee == this.loggedInUser.username)
          ) {
            return true;
          }
          this.toastr.error('You do not have permission to edit this ticket.');
          return false;
        })
      );
  }
}
