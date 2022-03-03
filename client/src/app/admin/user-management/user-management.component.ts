import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { RolesModalComponent } from 'src/app/modals/roles-modal/roles-modal.component';
import { Pagination } from 'src/app/_models/pagination';
import { UserParams } from 'src/app/_models/userParams';
import { AdminService } from 'src/app/_services/admin.service';
import { PaginatedUserDto } from 'src/app/_models/paginatedUserDto';
import { ResetPasswordModalComponent } from 'src/app/modals/reset-password-modal/reset-password-modal.component';
import { ResetPasswordDto } from 'src/app/_models/resetPasswordDto';
import { ResetEmailDto } from 'src/app/_models/resetEmailDto';
import { ToastrService } from 'ngx-toastr';
import { ResetEmailModalComponent } from 'src/app/modals/reset-email-modal/reset-email-modal.component';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  users: PaginatedUserDto[];
  bsModalRef: BsModalRef;
  pagination: Pagination;
  userParams: UserParams;

  constructor(
    private adminService: AdminService,
    private modalService: BsModalService,
    private toastr: ToastrService
  ) {
    this.userParams = new UserParams();
  }

  ngOnInit(): void {
    this.loadUsers();
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
    this.adminService.setUserParams(this.userParams);
  }

  loadUsers(toggle: boolean = false, index: number = this.userParams.index) {
    this.updateTable(toggle, index);
    this.getUsersWithRoles();
  }

  getUsersWithRoles() {
    this.adminService
      .getUsersWithRoles(this.userParams)
      .subscribe((response) => {
        this.users = response.result;
        this.pagination = response.pagination;
      });
  }

  openRolesModal(user: PaginatedUserDto) {
    const config = {
      class: 'modal-dialog-centered',
      initialState: {
        user,
        roles: this.getRolesArray(user),
      },
    };
    this.bsModalRef = this.modalService.show(RolesModalComponent, config);
    this.bsModalRef.content.updateSelectedRoles.subscribe((values) => {
      const rolesToUpdate = {
        roles: [
          ...values.filter((el) => el.checked === true).map((el) => el.name),
        ],
      };
      if (rolesToUpdate) {
        this.adminService
          .updateUserRoles(user.username, rolesToUpdate.roles)
          .subscribe(() => {
            user.roles = [...rolesToUpdate.roles];
          });
      }
    });
  }

  openResetPasswordModal(user: PaginatedUserDto) {
    const config = {
      class: 'modal-dialog-centered',
      initialState: {
        user,
      },
    };
    this.bsModalRef = this.modalService.show(
      ResetPasswordModalComponent,
      config
    );
    this.bsModalRef.content.submitted.subscribe((value) => {
      const submitted = value;
      if (submitted) {
        this.resetPassword();
      }
    });
  }

  openResetEmailModal(user: PaginatedUserDto) {
    const config = {
      class: 'modal-dialog-centered',
      initialState: {
        user,
      },
    };
    this.bsModalRef = this.modalService.show(ResetEmailModalComponent, config);
    this.bsModalRef.content.submitted.subscribe((value) => {
      const submitted = value;
      if (submitted) {
        this.resetEmail();
      }
    });
  }

  resetPassword() {
    const resetPasswordDto: ResetPasswordDto = {
      password: this.bsModalRef.content?.resetPasswordForm.value.password,
      confirmPassword:
        this.bsModalRef.content?.resetPasswordForm.value.confirmPassword,
      email: this.bsModalRef.content?.user.email,
      token: 'mock token',
    };
    this.adminService.resetPassword(resetPasswordDto).subscribe(
      (response) => {
        this.toastr.success('Password succesfully reset');
      },
      (error) => {
        console.log(error);
      }
    );
  }

  resetEmail() {
    const resetEmailDto: ResetEmailDto = {
      email: this.bsModalRef.content?.resetEmailForm.value.email,
      username: this.bsModalRef.content?.user.username,
    };
    this.adminService.resetEmail(resetEmailDto).subscribe(
      (response) => {
        this.toastr.success('Email succesfully reset');
      },
      (error) => {
        console.log(error);
      }
    );
  }

  sendConfirmationEmail(user: PaginatedUserDto) {
    
  }

  private getRolesArray(user) {
    const roles = [];
    const userRoles = user.roles;
    const availableRoles: any[] = [
      { name: 'Admin', value: 'Admin' },
      { name: 'Project Manager', value: 'Project Manager' },
      { name: 'Developer', value: 'Developer' },
    ];

    availableRoles.forEach((role) => {
      let isMatch = false;
      for (const userRole of userRoles) {
        if (role.name === userRole) {
          isMatch = true;
          role.checked = true;
          roles.push(role);
          break;
        }
      }
      if (!isMatch) {
        role.checked = false;
        roles.push(role);
      }
    });
    return roles;
  }

  pageChanged(event: any) {
    this.userParams.pageNumber = event.page;
    this.adminService.setUserParams(this.userParams);
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
}
