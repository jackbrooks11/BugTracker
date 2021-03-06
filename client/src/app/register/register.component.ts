import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RegisterDto } from '../_models/registerDto';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter();
  registerForm: FormGroup;
  confirmationEmailSent: boolean = false;
  validationErrors: string[] = [];

  constructor(
    private accountService: AccountService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      username: [
        '',
        Validators.compose([
          Validators.pattern(/^[a-zA-Z]*$/),
          Validators.maxLength(20),
          Validators.required,
        ]),
      ],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,25}$/),
          Validators.minLength(6),
          Validators.maxLength(25),
        ],
      ],
      confirmPassword: [
        '',
        [Validators.required, this.matchValues('password')],
      ],
    });
    this.registerForm.controls.password.valueChanges.subscribe(() => {
      this.registerForm.controls.confirmPassword.updateValueAndValidity();
    });
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control?.value === control?.parent?.controls[matchTo].value
        ? null
        : { isMatching: true };
    };
  }

  register() {
    const registerDto: RegisterDto = {
      username: this.registerForm.value.username.toLowerCase(),
      email: this.registerForm.value.email.toLowerCase(),
      password: this.registerForm.value.password,
      confirmPassword: this.registerForm.value.confirmPassword,
    };
    this.accountService.register(registerDto).subscribe(
      (response) => {
        this.confirmationEmailSent = true;
      },
      (error) => {
        this.validationErrors = error;
      }
    );
  }

  cancel() {
    this.cancelRegister.emit(false);
  }
}
