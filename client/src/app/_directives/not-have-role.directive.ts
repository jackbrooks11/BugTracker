import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { take } from 'rxjs/operators';
import { LoggedInUser } from '../_models/loggedInUser';
import { AccountService } from '../_services/account.service';

@Directive({
  selector: '[appNotHaveRole]'
})
export class NotHaveRoleDirective implements OnInit{
  @Input() appNotHaveRole: string[];
  loggedInUser: LoggedInUser;

  constructor(private viewContainerRef: ViewContainerRef, private templateRef: TemplateRef<any>, 
    private accountService: AccountService) {
      this.accountService.currentUser$.pipe(take(1)).subscribe(loggedInUser => {
        this.loggedInUser = loggedInUser;
      })
     }
  ngOnInit(): void {
    //clear view if no roles
    if (!this.loggedInUser?.roles || this.loggedInUser == null) {
      console.log("Cleared");
      this.viewContainerRef.clear();
      return;
    }

    if (this.loggedInUser?.roles.some(r => this.appNotHaveRole.includes(r))) {
      this.viewContainerRef.clear();
    }
    else {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    }
  }

}
