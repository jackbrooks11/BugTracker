import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { take } from 'rxjs/operators';
import { Project } from 'src/app/_models/project';
import { ProjectParams } from 'src/app/_models/projectParams';
import { User } from 'src/app/_models/user';
import { UserParams } from 'src/app/_models/userParams';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';
import { ProjectsService } from 'src/app/_services/projects.service';
import { ProjectUsersService } from 'src/app/_services/projectUsers.service';

@Component({
  selector: 'app-ticket-modal',
  templateUrl: './ticket-modal.component.html',
  styleUrls: ['./ticket-modal.component.css'],
})
export class TicketModalComponent implements OnInit {
  createTicketForm: FormGroup;
  validationErrors: string[] = [];
  userParams: UserParams = new UserParams();
  projectForUserParams: ProjectParams = new ProjectParams();
  users: User[] = [];
  filteredUsers: User[] = [];
  user: User;
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  projectTitle: string;
  hideProjects: boolean = true;
  disableUsers: boolean = true;
  hideUsers: boolean = true;
  disableLoadMoreProjects: boolean = false;
  disableLoadMoreUsers: boolean = false;
  @Input() submitted = new EventEmitter();
  hide: boolean = true;

  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private memberService: MembersService,
    private projectService: ProjectsService,
    private projectUserService: ProjectUsersService,
    private accountService: AccountService
  ) {
    this.disableLoadMoreProjects = this.projectService.disableLoadMoreProjects;
    this.disableLoadMoreUsers = this.projectUserService.disableLoadMoreUsers;
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.user = user));
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadProjects();
  }

  initializeForm() {
    this.createTicketForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      project: [''],
      assignee: [''],
      submitter: [this.user.username],
      priority: ['Medium'],
      type: ['Bug'],
    });
  }

  loadProjects() {
    this.projectForUserParams.searchMatch =
      this.projectForUserParams.searchMatch.toLowerCase();
    this.projectForUserParams.ascending = true;
    this.projectForUserParams.pageSize = 10;
    this.projectService
      .getProjectsForUser(this.projectForUserParams)
      .subscribe((response) => {
        this.projects = response.result;
        if (response.result.length == this.projectForUserParams.pageSize) {
          this.disableLoadMoreProjects = false;
          this.projectService.disableLoadMoreProjects = false;
        }
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

  getFilteredProjects() {
    this.hideProjects = false;
    this.disableUsers = true;
    this.projectForUserParams.searchMatch = this.createTicketForm.value.project;
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

  loadUsers(projectTitle: string) {
    this.userParams.searchMatch = this.userParams.searchMatch.toLowerCase();
    this.userParams.pageSize = 10;
    this.projectUserService
      .getMembersForProject(projectTitle, this.userParams)
      .subscribe((response) => {
        this.users = response.result;
        if (response.result.length == this.userParams.pageSize) {
          this.disableLoadMoreUsers = false;
          this.projectUserService.disableLoadMoreUsers = false;
        }
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

  getFilteredUsers() {
    this.hide = false;
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

  createTicket() {
    this.submitted.emit(true);
    this.bsModalRef.hide();
  }



  updateDeveloper(userName: string) {
    this.hide = true;
    this.userParams.searchMatch = userName;
    this.createTicketForm.controls['assignee'].setValue(userName);
  }

  /*Function called when project is clicked*/
  updateProject(title: string) {
    //Hide project list and allow user to assign user to ticket
    this.projectTitle = title;
    this.hideProjects = true;
    this.disableUsers = false;
    this.userParams.searchMatch = '';
    this.createTicketForm.controls['assignee'].setValue('');
    this.loadUsers(title);
    this.projectForUserParams.searchMatch = title;

    this.createTicketForm.controls['project'].setValue(title);
  }

  hideUserList() {
    this.hideUsers = true;
  }
}
