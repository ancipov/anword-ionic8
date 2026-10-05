import {
    Injectable,
    NgZone
} from '@angular/core';
import {
    BehaviorSubject
} from 'rxjs';
@Injectable()
export class ApperyioPWAHelperService {
    public swStatus = "";
    public swStatusSubject = new BehaviorSubject("");
    constructor(private ngZone: NgZone) {
        const setSwStatus = (swStatus) => {
            this.ngZone.run(() => {
                this.swStatus = swStatus;
                this.swStatusSubject.next(swStatus);
            })
        };
        window.addEventListener("sw-status", (event: any) => setSwStatus(event.detail.swStatus));
        window.dispatchEvent(new CustomEvent("request-sw-status", {
            detail: {
                callback: swStatus => setSwStatus(swStatus)
            }
        }));
    }
    getCurrentVersionDate(): string {
        return localStorage.apperyioPWACurrentDate;
    }
    async getLatestVersionDate(): Promise < string | undefined > {
        return new Promise((res, rej) => {
            if (window.location.hostname !== 'appery.io' && window.location.hostname !== 'localhost') {
                fetch('https://' + window.location.hostname + '/' + 'sw.js?date=' + Date.now())
                    .then(response => {
                        return response.headers.get('Last-Modified');
                    })
                    .then(function(date) {
                        res(date);
                    })
                    .catch(e => {
                        console.log('error', e);
                        res(undefined)
                    });
            } else {
                res(undefined);
            }
        })
    }
    async update(): Promise < void > {
        if (window.location.hostname !== 'appery.io' && window.location.hostname !== 'localhost') {
            const currDate = this.getCurrentVersionDate();
            if (!currDate) return;
            const availableDate = await this.getLatestVersionDate();
            if (!availableDate) return;
            if (currDate !== availableDate) {
                navigator.serviceWorker?.getRegistration()
                    .then((reg) => {
                        if (reg) {
                            reg.unregister().then(() => {
                                localStorage.apperyioPWACurrentDate = availableDate;
                                window.location.reload();
                            });
                        }
                    })
                    .catch(e => {
                        console.log('error', e);
                    });
            }
        }
    }
    isStandalone(): boolean {
        return window.matchMedia('(display-mode: standalone)').matches || ( < any > window.navigator).standalone === true;
    }
};