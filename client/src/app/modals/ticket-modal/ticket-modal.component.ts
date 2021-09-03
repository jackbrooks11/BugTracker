import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { take } from 'rxjs/operators';
import { Member } from 'src/app/_models/member';
import { Project } from 'src/app/_models/project';
import { ProjectParams } from 'src/app/_models/projectParams';
import { User } from 'src/app/_models/user';
import { UserParams } from 'src/app/_models/userParams';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';
import { ProjectsService } from 'src/app/_services/projects.service';

@Component({
  selector: 'app-ticket-modal',
  templateUrl: './ticket-modal.component.html',
  styleUrls: ['./ticket-modal.component.css'],
})
export class TicketModalComponent implements OnInit {
  createTicketForm: FormGroup;
  validationErrors: string[] = [];
  userParams: UserParams = new UserParams();
  projectParams: ProjectParams = new ProjectParams();
  members: Member[] = [];
  user: User;
  filteredMembers: Member[] = [];
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  hideProjects: boolean = true;
  disableMembers: boolean = false;
  hideMembers: boolean = true;

  @Input() submitted = new EventEmitter();
  hide: boolean = true;

  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private memberService: MembersService,
    private projectService: ProjectsService,
    private accountService: AccountService
  ) {
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.user = user));
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadProjects();
    this.loadMembers();
  }

  initializeForm() {
    this.createTicketForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      project: [''],
      assignedTo: [''],
      submittedBy: [this.user.username],
      priority: [''],
      type: [''],
    });
  }

  loadProjects() {
    this.projectParams.searchMatch =
      this.projectParams.searchMatch.toLowerCase();
    this.projectParams.ascending = true;
    this.projectService.setProjectParams(this.projectParams);
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

  getFilteredProjects() {
    this.hideProjects = false;
    this.projectParams.searchMatch = this.createTicketForm.value.project;
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

  loadMembers() {
    this.userParams.searchMatch = this.userParams.searchMatch.toLowerCase();
    this.memberService.setUserParams(this.userParams);
    this.memberService.getMembers(this.userParams).subscribe((response) => {
      this.members = response.result;
    });
  }

  createTicket() {
    this.submitted.emit(true);
    this.bsModalRef.hide();
  }

  getFilteredMembers() {
    this.hide = false;
    if (this.userParams.searchMatch == '') {
      this.filteredMembers = this.members;
      return;
    }
    this.filteredMembers = [];
    console.log(this.userParams.searchMatch);
    for (let i = 0; i < this.members.length; ++i) {
      if (this.members[i].userName.includes(this.userParams.searchMatch)) {
        this.filteredMembers.push(this.members[i]);
      }
    }
  }

  updateDeveloper(userName: string) {
    this.hide = true;
    this.userParams.searchMatch = userName;
    this.createTicketForm.controls['assignedTo'].setValue(userName);
  }

  hideMemberList() {
    this.hideMembers = true;
  }
}
