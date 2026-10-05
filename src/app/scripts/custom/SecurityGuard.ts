import {
    Injectable
} from '@angular/core';
import {
    CanActivate,
    Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    UrlTree
} from '@angular/router';
import {
    Observable
} from "rxjs";
import {
    ApperyioHelperService
} from '../apperyio/apperyio_helper';

/*
  See https://angular.io/guide/router for more info on guards.
*/


@Injectable({
    providedIn: 'root',
})
export class SecurityGuard implements CanActivate {
    private $a: ApperyioHelperService;
    private $v: any;
    constructor(private Apperyio: ApperyioHelperService, private router: Router) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
    }

    canActivate(next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable < boolean | UrlTree > | Promise < boolean | UrlTree > | boolean | UrlTree {

        if (this.$v.sessionToken) this.$a.db.setSessionToken(this.$v.sessionToken);
        if (this.$v.user?._id) return true;

        this.$v.originalPage = location.href;
        this.$a.navigateTo("login");
        return false;
    }
}

/*
    Guard class should be exported as ExportedClass
*/
export let ExportedClass = SecurityGuard;