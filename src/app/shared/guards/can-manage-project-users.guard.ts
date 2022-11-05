import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { PermissionsService } from '../services/permissions.service';

@Injectable({
  providedIn: 'root',
})
export class CanManageProjectUsersGuard implements CanActivate {
  constructor(
    private permissionsService: PermissionsService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): true | UrlTree {
    const url: string = state.url;

    return this.checkUserPermissions(url);
  }

  checkUserPermissions(url: string): true | UrlTree {
    if (this.permissionsService.getUserPermissions().canManageProjectUsers) {
      return true;
    }

    return this.router.parseUrl('/not-found');
  }
}
