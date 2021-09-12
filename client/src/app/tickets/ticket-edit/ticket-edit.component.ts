import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { Project } from 'src/app/_models/project';
import { ProjectParams } from 'src/app/_models/projectParams';
import { Ticket } from 'src/app/_models/ticket';
import { User } from 'src/app/_models/user';
import { UserParams } from 'src/app/_models/userParams';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';
import { ProjectsService } from 'src/app/_services/projects.service';
import { TicketsService } from 'src/app/_services/tickets.service';

@Component({
  selector: 'app-ticket-edit',
  templateUrl: './ticket-edit.component.html',
  styleUrls: ['./ticket-edit.component.css'],
})
export class TicketEditComponent implements OnInit {
  editTicketForm: FormGroup;
  @ViewChild('editForm') editForm: NgForm;
  user: User;
  userParams: UserParams = new UserParams();
  projectParams: ProjectParams = new ProjectParams();
  users: User[] = [];
  filteredUsers: User[] = [];
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  hideUsers: boolean = true;
  hideProjects: boolean = true;
  disableUsers: boolean = false;
  ticket: Ticket;
  @HostListener('window:beforeunload', ['$event']) unloadNotifcation(
    $event: any
  ) {
    if (this.editForm.dirty) {
      $event.returnValue = true;
    }
  }

  constructor(
    private ticketService: TicketsService,
    private memberService: MembersService,
    private projectService: ProjectsService,
    private accountService: AccountService,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.user = user));
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadTicket();
  }

  loadUsers(projectTitle: string) {
    this.userParams.searchMatch = this.userParams.searchMatch.toLowerCase();
    this.memberService.setUserParams(this.userParams);
    this.memberService.getMembersForProject(projectTitle, this.userParams).subscribe((response) => {
      this.users = response.result;
    });
  }

  loadProjects() {
    this.projectParams.searchMatch =
      this.projectParams.searchMatch.toLowerCase();
    this.projectParams.ascending = true;
    this.projectService.setProjectForUserParams(this.projectParams);
    if (this.user.roles.includes('Admin')) {
      this.projectService
        .getProjects(this.projectParams)
        .subscribe((response) => {
          this.projects = response.result;
        });
    } else {
      this.projectService
        .getProjectsForUser(this.projectParams)
        .subscribe((response) => {
          this.projects = response.result;
        });
    }
  }

  loadTicket() {
    this.ticketService
      .getTicket(Number(this.route.snapshot.paramMap.get('id')))
      .subscribe((ticket) => {
        this.ticket = ticket;
        this.userParams.searchMatch = ticket.assignedTo;
        this.loadUsers(this.ticket.project);
      });
  }

  updateTicket() {
    this.ticketService.updateTicket(this.ticket).subscribe(() => {
      this.toastr.success('Ticket updated successfully');
      this.editForm.reset(this.ticket);
    });
  }

  getFilteredUsers() {
    this.hideUsers = false;
    this.userParams.searchMatch = this.ticket.assignedTo;
    if (this.userParams.searchMatch == '') {
      this.filteredUsers = this.users;
      return;
    }
    this.filteredUsers = [];
    for (let i = 0; i < this.users.length; ++i) {
      if (this.users[i].username.includes(this.userParams.searchMatch)) {
        this.filteredUsers.push(this.users[i]);
      }
    }
  }

  updateDeveloper(userName: string) {
    this.hideUsers = true;
    this.userParams.searchMatch = userName;
    this.editForm.controls['assignedTo'].setValue(userName);
  }

  getFilteredProjects() {
    this.hideProjects = false;
    this.disableUsers = true;
    this.projectParams.searchMatch = this.ticket.project;
    if (this.projectParams.searchMatch == '') {
      this.filteredProjects = this.projects;
      return;
    }
    this.filteredProjects = [];
    for (let i = 0; i < this.projects.length; ++i) {
      if (this.projects[i].title.includes(this.projectParams.searchMatch)) {
        this.filteredProjects.push(this.projects[i]);
      }
    }
  }

  /*Function called when project is clicked*/
  updateProject(title: string) {
    //Hide project list and allow user to assign member to ticket
    this.hideProjects = true;
    this.disableUsers = false;

    this.userParams.searchMatch = '';
    this.editForm.controls['assignedTo'].setValue('');
    this.loadUsers(title);

    this.projectParams.searchMatch = title;
    this.editForm.controls['project'].setValue(title);
  }

  hideUserList() {
    this.hideUsers = true;
  }
}
