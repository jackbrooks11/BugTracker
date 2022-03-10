import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { take } from 'rxjs/operators';
import { PersonnelModalComponent } from 'src/app/modals/personnel-modal/personnel-modal.component';
import { Pagination } from 'src/app/_models/pagination';
import { Project } from 'src/app/_models/project';
import { LoggedInUser } from 'src/app/_models/loggedInUser';
import { UserParams } from 'src/app/_models/userParams';
import { AccountService } from 'src/app/_services/account.service';
import { UserService } from 'src/app/_services/user.service';
import { ProjectsService } from 'src/app/_services/projects.service';
import { ProjectUsersService } from 'src/app/_services/projectUsers.service';
import { PaginatedProjectUserDto } from 'src/app/_models/paginatedProjectUserDto';

@Component({
  selector: 'app-project-personnel',
  templateUrl: './project-personnel.component.html',
  styleUrls: ['./project-personnel.component.css'],
})
export class ProjectPersonnelComponent implements OnInit {
  loggedInUser: LoggedInUser;
  users: PaginatedProjectUserDto[];
  pagination: Pagination;
  bsModalRef: BsModalRef;
  userParams: UserParams = new UserParams();
  project: Project;
  checkAll: boolean = false;
  usernamesToDelete: string[] = [];

  constructor(
    private projectUsersService: ProjectUsersService,
    private accountService: AccountService,
    private userService: UserService,
    private projectService: ProjectsService,
    private projectUserService: ProjectUsersService,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((loggedInUser) => (this.loggedInUser = loggedInUser));
  }

  ngOnInit(): void {
    this.projectService
      .getProjectById(Number(this.route.snapshot.paramMap.get('id')))
      .subscribe((project) => {
        this.project = project;
        this.loadUsers();
      });
  }

  ngAfterViewChecked() {
    //your code to update the model
    this.cdr.detectChanges();
  }
  loadUsers(toggle: boolean = false, index: number = this.userParams.index) {
    this.updateTable(toggle, index);
    this.getUsersWithRoles();
  }

  getUsersWithRoles() {
    this.projectUserService
      .getUsersForProjectPaginated(this.userParams, this.project.title)
      .subscribe((response) => {
        (this.users = response.result), (this.pagination = response.pagination);
      });
  }

  updateTable(toggle: boolean, index: number) {
    if (toggle) {
      this.changeIcon(index);
      //New column has been clicked
      if (this.userParams.index != index) {
        //Set old icon to double arrows
        this.userParams.icons[this.userParams.index] = 0;
        //New index for column clicked
        this.userParams.index = index;
        this.userParams.ascending = true;
      }
      //Still on same column
      else {
        this.toggleAscending();
      }
    }
    this.userParams.searchMatch = this.userParams.searchMatch.toLowerCase();
    this.userService.setUserParams(this.userParams);
  }

  pageChanged(event: any) {
    this.userParams.pageNumber = event.page;
    this.userService.setUserParams(this.userParams);
    this.loadUsers();
  }

  toggleAscending() {
    this.userParams.ascending = !this.userParams.ascending;
  }

  changeIcon(index: number) {
    if (this.userParams.icons[index] == 2) {
      --this.userParams.icons[index];
    } else {
      ++this.userParams.icons[index];
    }
  }

  addUserToProject() {
    this.projectUsersService
      .addUserToProject(
        this.project.id,
        this.bsModalRef.content.assignUserForm.value.username.toLowerCase()
      )
      .subscribe(() => {
        this.loadUsers();
        this.projectUserService.userNotInProjectCache.clear();
        this.projectUserService.projectsForUserCache.clear();
      });
  }

  deleteUsers() {
    if (confirm('Are you sure to delete the selected user(s)?')) {
      this.projectUsersService
        .deleteUsersFromProject(this.project, this.usernamesToDelete)
        .subscribe((value) => {
          this.usernamesToDelete = [];
          this.loadUsers();
        });
    }
  }

  openRolesModal() {
    const config = {
      class: 'modal-dialog-centered',
      initialState: {
        project: this.project,
      },
    };
    this.bsModalRef = this.modalService.show(PersonnelModalComponent, config);
    this.bsModalRef.content.submitted.subscribe((value) => {
      const submitted = value;
      if (submitted) {
        this.addUserToProject();
      }
    });
  }

  toggleCheckAll = (evt) => {
    this.checkAll = !this.checkAll;
    if (evt.target.checked == true) {
      this.users.forEach((val) => this.usernamesToDelete.push(val.username));
    } else {
      this.usernamesToDelete.length = 0;
    }
  };

  changed = (evt, username: string) => {
    if (evt.target.checked == true) {
      this.usernamesToDelete.push(username);
    } else {
      this.usernamesToDelete.splice(
        this.usernamesToDelete.indexOf(username),
        1
      );
    }
  };

  containsUser() {
    if (this.loggedInUser.roles.includes('Admin')) {
      return true;
    }
    for (var user of this.users) {
      if (user.username === this.loggedInUser.username) {
        return true;
      }
    }
    return false;
  }
}
