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
import { EditMemberDto } from 'src/app/_models/editMemberDto';
import { Member } from 'src/app/_models/member';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css'],
})
export class MemberEditComponent implements OnInit {
  editForm: FormGroup;
  editMember: EditMemberDto = Object();
  passwordForm: FormGroup;
  member: Member = null;
  user: User;
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
    private memberService: MembersService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.user = user));
  }

  initializeForm() {
    this.editForm = this.fb.group({
      fullName: [this.member.fullName],
      about: [this.member.about],
      company: [this.member.company],
      password: ['', [Validators.minLength(6), Validators.maxLength(25)]],
      confirmPassword: ['', [this.matchValues('password')]],
    });
    this.editForm.controls.password.valueChanges.subscribe(() => {
      this.editForm.controls.confirmPassword.updateValueAndValidity();
    });
  }
  ngOnInit(): void {
    this.loadMember();
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control?.value === control?.parent?.controls[matchTo].value
        ? null
        : { isMatching: true };
    };
  }

  loadMember() {
    this.memberService.getMember(this.user.username).subscribe((member) => {
      this.member = member;
      this.initializeForm();
    });
  }

  updateMember() {
    console.log(this.editForm.controls.password.value);
    this.editMember.fullName = this.editForm.controls.fullName.value;
    this.editMember.company = this.editForm.controls.company.value;
    this.editMember.about = this.editForm.controls.about.value;
    this.editMember.password = this.editForm.controls.password.value;
    this.memberService.updateMember(this.editMember).subscribe((member) => {
      this.member = member;
      this.toastr.success('Profile updated successfully');
      this.editForm.reset(this.member);
      this.initializeForm();
    });
  }

  changeSettingsMode(change: boolean) {
    this.settingsMode = change;
  }
}
