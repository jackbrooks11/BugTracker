import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { take } from 'rxjs/operators';
import { LoggedInUser } from 'src/app/_models/loggedInUser';
import { AccountService } from 'src/app/_services/account.service';

@Component({
  selector: 'app-user-modal',
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.css'],
})
export class UserModalComponent implements OnInit {
  @Input() submitted = new EventEmitter();
  createUserForm: FormGroup;
  validationErrors: string[] = [];
  loggedInUser: LoggedInUser;
  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private accountService: AccountService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe((loggedInUser) => {
      this.loggedInUser = loggedInUser;
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.createUserForm = this.fb.group({
      username: ['',
        Validators.compose([
          Validators.pattern(/^[a-zA-Z]*$/),
          Validators.maxLength(20),
          Validators.required
        ]),
      ],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(25),
          Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,25}$/),
        ],
      ],
      confirmPassword: [
        '',
        [Validators.required, this.matchValues('password')],
      ],
    });
    this.createUserForm.controls.password.valueChanges.subscribe(() => {
      this.createUserForm.controls.confirmPassword.updateValueAndValidity();
    });
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control?.value === control?.parent?.controls[matchTo].value
        ? null
        : { isMatching: true };
    };
  }

  createUser() {
    this.submitted.emit(true);
    this.bsModalRef.hide();
  }
}
