import { inject } from '@angular/core';
import {
  CanActivateFn
} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { map, switchMap, take } from 'rxjs/operators';
import { Ticket } from '../_models/ticket';
import { AccountService } from '../_services/account.service';
import { ProjectUsersService } from '../_services/projectUsers.service';
import { TicketsService } from '../_services/tickets.service';


export const hasTicketGuard: CanActivateFn = (route, state) => {
  var loggedInUser;
  const accountService = inject(AccountService);
  const ticketService = inject(TicketsService);
  const projectUserService = inject(ProjectUsersService);
  const toastr = inject(ToastrService);

  accountService.currentUser$.pipe(take(1)).subscribe((loggedInUser) => {
    loggedInUser = loggedInUser;
  });

  return ticketService
    .getTicket(Number(route.paramMap.get('id')))
    .pipe(
      switchMap((ticket: Ticket) =>
        projectUserService
          .getUsersForProject(ticket.project)
          .pipe(map((users) => [ticket, users]))
      )
    )
    .pipe(
      map((finalData) => {
        if (
          (loggedInUser?.roles.includes('Project Manager') &&
            finalData[1].includes(loggedInUser.username)) ||
          loggedInUser?.roles.includes('Admin') ||
          (loggedInUser?.roles.includes('Developer') &&
            finalData[0].assignee == loggedInUser.username)
        ) {
          return true;
        }
        toastr.error('You do not have permission to edit this ticket.');
        return false;
      })
    );
  }