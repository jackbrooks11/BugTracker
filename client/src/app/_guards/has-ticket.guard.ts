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
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';
import { ProjectUsersService } from '../_services/projectUsers.service';
import { TicketsService } from '../_services/tickets.service';

@Injectable({
  providedIn: 'root',
})
export class HasTicketGuard implements CanActivate {
  user: User;

  constructor(
    private accountService: AccountService,
    private ticketService: TicketsService,
    private projectUserService: ProjectUsersService,
    private toastr: ToastrService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe((user) => {
      this.user = user;
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
            (this.user?.roles.includes('Project Manager') &&
              finalData[1].includes(this.user.username)) ||
            this.user?.roles.includes('Admin') ||
            (this.user?.roles.includes('Developer') &&
              finalData[0].assignee == this.user.username)
          ) {
            return true;
          }
          this.toastr.error('You do not have permission to edit this ticket.');
          return false;
        })
      );
  }
}
