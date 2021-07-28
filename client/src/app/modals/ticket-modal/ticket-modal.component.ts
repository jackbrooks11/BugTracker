import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { Member } from 'src/app/_models/member';
import { User } from 'src/app/_models/user';
import { UserParams } from 'src/app/_models/userParams';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-ticket-modal',
  templateUrl: './ticket-modal.component.html',
  styleUrls: ['./ticket-modal.component.css']
})
export class TicketModalComponent implements OnInit {
  createTicketForm: FormGroup;
  validationErrors: string[] = [];
  userParams: UserParams = new UserParams();
  members: Member[] = [];
  user: User;
  filteredMembers: Member[] = [];
  @Input() submitted = new EventEmitter();
  hide: boolean = true;

  constructor(public bsModalRef: BsModalRef, private toastr: ToastrService, 
    private fb: FormBuilder, private memberService: MembersService, private accountService: AccountService) 
    { 
      this.accountService.currentUser$.pipe(take(1)).subscribe(user => this.user = user);
    }

  ngOnInit(): void {
    this.initializeForm();
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
      type: ['']
    })
  }

  loadMembers() {
    this.userParams.searchMatch = this.userParams.searchMatch.toLowerCase();
    this.memberService.setUserParams(this.userParams);
    this.memberService.getMembers(this.userParams).subscribe(response => {
      this.members = response.result;
    })
  }

  createTicket() {
    this.submitted.emit(true);
    this.bsModalRef.hide();
  }

  getFilteredMembers() {
    this.hide = false;
    if (this.userParams.searchMatch == "") {
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
}
