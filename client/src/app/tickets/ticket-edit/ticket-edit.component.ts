import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { Project } from 'src/app/_models/project';
import { Ticket } from 'src/app/_models/ticket';
import { LoggedInUser } from 'src/app/_models/loggedInUser';
import { AccountService } from 'src/app/_services/account.service';
import { ProjectsService } from 'src/app/_services/projects.service';
import { ProjectUsersService } from 'src/app/_services/projectUsers.service';
import { TicketPropertyChangesService } from 'src/app/_services/ticketPropertyChanges.service';
import { TicketsService } from 'src/app/_services/tickets.service';

@Component({
  selector: 'app-ticket-edit',
  templateUrl: './ticket-edit.component.html',
  styleUrls: ['./ticket-edit.component.css'],
})
export class TicketEditComponent implements OnInit {
  editForm: FormGroup;
  loggedInUser: LoggedInUser;

  usernames: string[] = [];
  displayUsernames: string[] = [];
  hideUsers: boolean = true;
  disableUsers: boolean = false;

  projects: Project[] = [];
  displayProjects: string[] = [];
  hideProjects: boolean = true;

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
    private fb: FormBuilder,
    private accountService: AccountService,
    private projectService: ProjectsService,
    private projectUserService: ProjectUsersService,
    private ticketPropertyChangeService: TicketPropertyChangesService,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((loggedInUser) => (this.loggedInUser = loggedInUser));
  }

  ngOnInit(): void {
    this.loadTicket();
  }

  initializeForm() {
    this.editForm = this.fb.group({
      title: [
        this.ticket.title,
        Validators.compose([
          Validators.pattern(/^(([a-z|A-Z]+(?: [a-z|A-Z]+)*)|)$/),
          Validators.minLength(6),
          Validators.maxLength(25),
          Validators.required,
        ]),
      ],
      description: [
        this.ticket.description,
        Validators.compose([
          Validators.pattern(/^(([\S]+(?: [\S]+)*)|)$/),
          Validators.minLength(10),
          Validators.maxLength(100),
          Validators.required,
        ]),
      ],
      project: [this.ticket.project],
      assignee: [this.ticket.assignee],
      priority: [this.ticket.priority],
      state: [this.ticket.state],
      type: [this.ticket.type],
    });
  }

  loadProjects() {
    if (this.loggedInUser.roles.includes('Admin')) {
      this.projectService.getProjects().subscribe((response) => {
        this.projects = response;
        this.filterProjects();
      });
    } else {
      this.projectUserService
        .getProjectsForUser(this.loggedInUser.username)
        .subscribe((response) => {
          this.projects = response;
          this.filterProjects();
        });
    }
  }

  projectInput() {
    this.hideProjects = false;
    this.hideUsers = true;
    this.disableUsers = true;
    this.filterProjects();
  }

  filterProjects() {
    var filteredProjects = [];
    this.projects.forEach((project) => {
      if (
        project.title.toLowerCase().includes(this.ticket.project.toLowerCase())
      ) {
        filteredProjects.push(this.toTitleCase(project.title));
      }
    });
    this.displayProjects = filteredProjects;
  }

  /*Function called when project is clicked*/
  updateProject(title: string) {
    this.hideProjects = true;
    this.disableUsers = false;
    this.ticket.project = title;
    this.ticket.assignee = '';
    this.loadUsers(title);
  }

  userInput() {
    this.hideUsers = false;
    this.filterUsernames();
  }

  loadUsers(projectTitle: string) {
    if (
      this.loggedInUser.roles.includes('Admin') ||
      this.loggedInUser.roles.includes('Project Manager')
    ) {
      this.projectUserService
        .getUsersForProject(projectTitle)
        .subscribe((users) => {
          this.usernames = users;
          this.filterUsernames();
        });
    } else {
      this.usernames = [this.loggedInUser.username];
      this.filterUsernames();
    }
  }

  filterUsernames() {
    var filteredUsernames = [];
    var lenFilteredUsernames = 0;
    this.usernames.forEach((username) => {
      if (username.toLowerCase().includes(this.ticket.assignee.toLowerCase())) {
        filteredUsernames.push(this.toTitleCase(username));
        lenFilteredUsernames += 1;
      }
    });
    this.displayUsernames = filteredUsernames;
  }

  updateDeveloper(userName: string) {
    this.hideUsers = true;
    this.ticket.assignee = userName;
    this.editForm.markAsDirty();
  }

  loadTicket() {
    this.ticketService
      .getTicket(Number(this.route.snapshot.paramMap.get('id')))
      .subscribe((ticket) => {
        this.ticket = ticket;
        this.initializeTicket();
        this.initializeForm();
        this.loadUsers(ticket.project);
        this.loadProjects();
      });
  }
  updateTicket() {
    var ticket = this.finalizeTicket();
    this.ticketService.updateTicket(ticket).subscribe(() => {
      this.clearCaches();
      this.loadTicket();
      this.onUpdate();
      this.toastr.success('Ticket updated successfully');
    });
  }

  markDirty() {
    this.editForm.markAsDirty();
  }

  onUpdate() {
    this.hideUsers = true;
  }

  clearCaches() {
    this.ticketPropertyChangeService.changeCache.clear();
    this.projectService.projectCache.clear();
    this.projectService.projectForUserCache.clear();
    this.ticketService.ticketForProjectCache.clear();
    this.ticketService.ticketCache.clear();
    this.ticketService.ticketForUserCache.clear();
  }

  initializeTicket() {
    this.ticket.title = this.toTitleCase(this.ticket.title);
    this.ticket.project = this.toTitleCase(this.ticket.project);
    if (![null, ''].includes(this.ticket.assignee)) {
      this.ticket.assignee = this.toTitleCase(this.ticket.assignee);
    } else {
      this.ticket.assignee = 'Unassigned';
    }
  }

  finalizeTicket() {
    var ticket = Object.assign({}, this.ticket);
    ticket.title = this.editForm.value.title.toLowerCase();
    ticket.description = this.editForm.value.description;
    ticket.project = this.ticket.project.toLowerCase();
    if (this.ticket.assignee == 'Unassigned') {
      ticket.assignee = '';
    } else {
      ticket.assignee = this.ticket.assignee.toLowerCase();
    }
    return ticket;
  }

  toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
}
