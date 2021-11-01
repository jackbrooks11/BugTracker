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
import { ProjectUsersService } from 'src/app/_services/projectUsers.service';
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
  projectForUserParams: ProjectParams = new ProjectParams();
  users: User[] = [];
  filteredUsers: User[] = [];
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  projectTitle: string;
  hideUsers: boolean = true;
  hideProjects: boolean = true;
  disableUsers: boolean = false;
  disableLoadMoreProjects: boolean = false;
  disableLoadMoreUsers: boolean = true;
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
    private projectUserService: ProjectUsersService,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.disableLoadMoreProjects = this.projectService.disableLoadMoreProjects;
    this.disableLoadMoreUsers = this.projectUserService.disableLoadMoreUsers;
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
    this.userParams.pageSize = 10;
    this.projectUserService
      .getMembersForProject(projectTitle, this.userParams)
      .subscribe((response) => {
        if (response.result.length == this.userParams.pageSize) {
          this.disableLoadMoreUsers = false;
          this.projectUserService.disableLoadMoreUsers = false;
        }
        this.users = response.result;
        this.userParams.searchMatch = this.ticket.assignee;
      });
  }

  loadMoreUsers() {
    this.userParams.pageNumber += 1;
    this.projectUserService
      .getMembersForProject(this.projectTitle, this.userParams)
      .subscribe((response) => {
        response.result.forEach((element) => this.users.push(element));
        if (response.result.length < this.userParams.pageSize) {
          this.disableLoadMoreUsers = true;
          this.projectUserService.disableLoadMoreUsers = true;
        }
        this.getFilteredUsers();
      });
  }

  loadProjects() {
    this.projectForUserParams.searchMatch =
      this.projectForUserParams.searchMatch.toLowerCase();
    this.projectForUserParams.ascending = true;
    this.projectService.setProjectForUserParams(this.projectForUserParams);
    this.projectService
      .getProjectsForUser(this.projectForUserParams)
      .subscribe((response) => {
        if (response.result.length == this.userParams.pageSize) {
          this.disableLoadMoreProjects = false;
          this.projectService.disableLoadMoreProjects = false;
        }
        this.projects = response.result;
      });
  }

  loadMoreProjects() {
    this.projectForUserParams.pageNumber += 1;
    this.projectService
      .getProjectsForUser(this.projectForUserParams)
      .subscribe((response) => {
        response.result.forEach((element) => this.projects.push(element));
        if (response.result.length < this.projectForUserParams.pageSize) {
          this.disableLoadMoreProjects = true;
          this.projectService.disableLoadMoreProjects = true;
        }
        this.getFilteredProjects();
      });
  }

  loadTicket() {
    this.ticketService
      .getTicket(Number(this.route.snapshot.paramMap.get('id')))
      .subscribe((ticket) => {
        this.ticket = ticket;
        this.projectTitle = ticket.project;
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
    this.userParams.searchMatch = this.ticket.assignee;
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
    this.editForm.controls['assignee'].setValue(userName);
  }

  getFilteredProjects() {
    this.hideProjects = false;
    this.disableUsers = true;
    this.projectForUserParams.searchMatch = this.ticket.project;
    if (this.projectForUserParams.searchMatch == '') {
      this.filteredProjects = this.projects;
      return;
    }
    this.filteredProjects = [];
    for (let i = 0; i < this.projects.length; ++i) {
      if (
        this.projects[i].title.includes(this.projectForUserParams.searchMatch)
      ) {
        this.filteredProjects.push(this.projects[i]);
      }
    }
  }

  /*Function called when project is clicked*/
  updateProject(title: string) {
    this.projectTitle = title;
    //Hide project list and allow user to assign member to ticket
    this.hideProjects = true;
    this.disableUsers = false;

    this.userParams.searchMatch = '';
    this.editForm.controls['assignee'].setValue('');
    this.loadUsers(title);

    this.projectForUserParams.searchMatch = title;
    this.editForm.controls['project'].setValue(title);
  }

  hideUserList() {
    this.hideUsers = true;
  }
}
