import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Member } from 'src/app/_models/member';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
import { AdminService } from 'src/app/_services/admin.service';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css'],
})
export class MemberDetailComponent implements OnInit {
  member: Member;
  user: Partial<User>;
  editConfig: boolean[] = [false, false, false, false];

  constructor(
    public accountService: AccountService,
    private memberService: MembersService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadMember();
    this.getMemberWithRoles();
  }

  loadMember() {
    this.memberService
      .getMember(this.route.snapshot.paramMap.get('username'))
      .subscribe((member) => {
        this.member = member;
      });
  }

  getMemberWithRoles() {
    this.memberService.getMemberRoles(this.route.snapshot.paramMap.get('username')).subscribe(user => {
      console.log(user);
      this.user = user;
    })
  }

  toggleInput(index: number) {
    this.editConfig[index] = !this.editConfig[index];
    console.log('HII');
    return 1;
  }
}
