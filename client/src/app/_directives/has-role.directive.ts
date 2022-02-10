import {
  Directive,
  Input,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { take } from 'rxjs/operators';
import { LoggedInUser } from '../_models/loggedInUser';
import { AccountService } from '../_services/account.service';

@Directive({
  selector: '[appHasRole]',
})
export class HasRoleDirective implements OnInit {
  @Input() appHasRole: string[];
  loggedInUser: LoggedInUser;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private accountService: AccountService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe((loggedInUser) => {
      this.loggedInUser = loggedInUser;
    });
  }
  ngOnInit(): void {
    //clear view if no roles
    if (!this.loggedInUser?.roles || this.loggedInUser == null) {
      this.viewContainerRef.clear();
      return;
    }

    if (this.loggedInUser?.roles.some((r) => this.appHasRole.includes(r))) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  }
}
