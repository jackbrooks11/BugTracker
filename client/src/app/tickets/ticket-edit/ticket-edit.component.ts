import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { Member } from 'src/app/_models/member';
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
  members: Member[] = [];
  filteredMembers: Member[] = [];
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  hideMembers: boolean = true;
  hideProjects: boolean = true;
  disableMembers: boolean = false;
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

  loadMembers(projectTitle: string) {
    this.userParams.searchMatch = this.userParams.searchMatch.toLowerCase();
    this.memberService.setUserParams(this.userParams);
    this.memberService.getMembersForProject(projectTitle, this.userParams).subscribe((response) => {
      this.members = response.result;
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

  loadTicket() {
    this.ticketService
      .getTicket(Number(this.route.snapshot.paramMap.get('id')))
      .subscribe((ticket) => {
        this.ticket = ticket;
        this.userParams.searchMatch = ticket.assignedTo;
        this.loadMembers(this.ticket.project);
      });
  }

  updateTicket() {
    this.ticketService.updateTicket(this.ticket).subscribe(() => {
      this.toastr.success('Ticket updated successfully');
      this.editForm.reset(this.ticket);
    });
  }

  getFilteredMembers() {
    this.hideMembers = false;
    this.userParams.searchMatch = this.ticket.assignedTo;
    if (this.userParams.searchMatch == '') {
      this.filteredMembers = this.members;
      return;
    }
    this.filteredMembers = [];
    for (let i = 0; i < this.members.length; ++i) {
      if (this.members[i].userName.includes(this.userParams.searchMatch)) {
        this.filteredMembers.push(this.members[i]);
      }
    }
  }

  updateDeveloper(userName: string) {
    this.hideMembers = true;
    this.userParams.searchMatch = userName;
    this.editForm.controls['assignedTo'].setValue(userName);
  }

  getFilteredProjects() {
    this.hideProjects = false;
    this.disableMembers = true;
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
    this.disableMembers = false;

    this.userParams.searchMatch = '';
    this.editForm.controls['assignedTo'].setValue('');
    this.loadMembers(title);

    this.projectParams.searchMatch = title;
    this.editForm.controls['project'].setValue(title);
  }

  hideMemberList() {
    this.hideMembers = true;
  }
}
