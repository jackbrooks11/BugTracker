import { CanDeactivateFn } from '@angular/router';
import { UserEditComponent } from '../users/user-edit/user-edit.component';

export const preventUnsavedChangesGuard: CanDeactivateFn<UserEditComponent> = (component) => {
    if (component.editForm?.dirty) {
      return confirm('Are you sure you want to continue? Any unsaved changes will be lost');
    }
    return true;
};
