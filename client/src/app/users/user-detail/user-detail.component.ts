import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { User } from 'src/app/_models/user';
import { LoggedInUser } from 'src/app/_models/loggedInUser';
import { AccountService } from 'src/app/_services/account.service';
import { UserService } from 'src/app/_services/user.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css'],
})
export class UserDetailComponent implements OnInit {
  user: User;
  roles: Partial<LoggedInUser>;
  loggedInUser: LoggedInUser;
  editConfig: boolean[] = [false, false, false, false];

  constructor(
    public accountService: AccountService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.accountService.currentUser$
    .pipe(take(1))
    .subscribe((loggedInUser) => (this.loggedInUser = loggedInUser));
  }

  ngOnInit(): void {
    this.loadUser();
    this.getUserWithRoles();
  }

  loadUser() {
    this.userService
      .getUser(this.route.snapshot.paramMap.get('username'))
      .subscribe(
        (user) => {
          if (user == null) {
            this.router.navigateByUrl('/not-found');
          }
          if (user.userName == this.loggedInUser.username) {
            this.router.navigateByUrl('/member/edit');
          }
          this.user = user;
        },
        (error) => {
          this.router.navigateByUrl('/not-found');
        }
      );
  }

  getUserWithRoles() {
    this.userService
      .getUserRoles(this.route.snapshot.paramMap.get('username'))
      .subscribe((roles) => {
        this.roles = roles;
        console.log(roles);
      });
  }

  toggleInput(index: number) {
    this.editConfig[index] = !this.editConfig[index];
    return 1;
  }
}
