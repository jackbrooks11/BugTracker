import { Component, HostListener, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { EditUserDto } from 'src/app/_models/editUserDto';
import { User } from 'src/app/_models/user';
import { LoggedInUser } from 'src/app/_models/loggedInUser';
import { AccountService } from 'src/app/_services/account.service';
import { UserService } from 'src/app/_services/user.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
})
export class UserEditComponent implements OnInit {
  editForm: FormGroup;
  editUser: EditUserDto = Object();
  passwordForm: FormGroup;
  user: User = null;
  loggedInUser: LoggedInUser;
  settingsMode = true;

  @HostListener('window:beforeunload', ['$event']) unloadNotifcation(
    $event: any
  ) {
    if (this.editForm.dirty) {
      $event.returnValue = true;
    }
  }

  constructor(
    private accountService: AccountService,
    private userService: UserService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe((loggedInUser) => {
      this.loggedInUser = loggedInUser;
    });
  }

  initializeForm() {
    this.editForm = this.fb.group(
      {
        fullName: [this.user.fullName],
        about: [this.user.about],
        email: [this.user.email],
        password: ['', [Validators.minLength(6), Validators.maxLength(25)]],
        newPassword: [
          '',
          [
            Validators.minLength(6),
            Validators.maxLength(25),
            Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,25}$/),
          ],
        ],
        confirmPassword: ['', [this.matchValues('newPassword')]],
      },
      { validators: this.passwordsFilledOutValidator }
    );
    this.editForm.controls.newPassword.valueChanges.subscribe(() => {
      this.editForm.controls.confirmPassword.updateValueAndValidity();
    });
  }
  ngOnInit(): void {
    this.loadUser();
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control?.value === control?.parent?.controls[matchTo].value
        ? null
        : { isMatching: true };
    };
  }
  passwordsFilledOutValidator = (control: AbstractControl) => {
    console.log(control);
    var password = control.get('password');
    var newPassword = control.get('newPassword');
    var confirmPassword = control.get('confirmPassword');
    const values = [password.value, newPassword.value, confirmPassword.value];
    return values.every((x) => x === '') || values.every((x) => x !== '')
      ? null
      : { passwordsFilledOut: true };
  };
  loadUser() {
    this.userService.getUser(this.loggedInUser.username).subscribe((user) => {
      this.user = user;
      this.initializeForm();
    });
  }

  updateUser() {
    this.editUser.fullName = this.editForm.controls.fullName.value;
    this.editUser.about = this.editForm.controls.about.value;
    this.editUser.password = this.editForm.controls.password.value;
    this.editUser.newPassword = this.editForm.controls.newPassword.value;
    this.accountService.updateUser(this.editUser).subscribe((user) => {
      this.user = user;
      this.toastr.success('Profile updated successfully');
      this.initializeForm();
      this.editForm.markAsUntouched();
    });
  }

  changeSettingsMode(change: boolean) {
    this.settingsMode = change;
  }
}
