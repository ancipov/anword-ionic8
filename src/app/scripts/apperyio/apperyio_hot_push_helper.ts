import {
    Injectable
} from '@angular/core';
import {
    HttpClient
} from '@angular/common/http';
import {
    Platform
} from '@ionic/angular';
import {
    projectInfo
} from '../constants';
@Injectable()
export class ApperyioHotPushHelperService {
    public projectInfo = projectInfo;
    constructor(
        private http: HttpClient,
        private platform: Platform,
    ) {}
    private generateErrorMessage(error) {
        console.error('Error', error);
        return {
            status: "Error",
            message: error
        };
    }
    private generateSuccessMessage(data?: any) {
        let message: {
            status: string;data?: any
        } = {
            status: "Success"
        };
        if (data) {
            console.info('Success', data);
            message.data = data;
        } else {
            console.info('Success');
        }
        return message;
    }
    private getHotcodeUrl(): string {
        const platformGuid = this.projectInfo.guid;
        const platformMode = this.platform.is('android')?
        'android': 'ios';
        return 'https://upd.appery.io/hotcode/' + platformGuid + '/' + platformMode + '/chcp.json';
    }
    private isCordovaUsed() {
        return window.cordova && window.chcp;
    }
    async getAutoupdateVersion(): Promise < any > {
        let result: any = '';
        try {
            if (this.isCordovaUsed()) {
                return new Promise((r) => {
                    window.chcp.getVersionInfo((error, data) => {
                        result = error? this.generateErrorMessage(error): this.generateSuccessMessage(data);
                        r(result);
                    });
                });
            }
            return this.generateErrorMessage('Cordova hot push plugin does not exist');
        } catch (error) {
            return this.generateErrorMessage(error);
        }
    }
    async getAutoupdateServerVersionSync(): Promise < any > {
        try {
            if (this.isCordovaUsed()) {
                const response: any = await this.http.get(this.getHotcodeUrl()).toPromise();
                return this.generateSuccessMessage(response);
            }
            return this.generateErrorMessage('Cordova hot push plugin does not exist');
        } catch (error) {
            return this.generateErrorMessage(error);
        }
    }
    async autoupdateDownloadLatestVersion(): Promise < any > {
        try {
            if (this.isCordovaUsed()) {
                const options = {
                    'config-file': this.getHotcodeUrl()
                };
                return new Promise((r) => {
                    window.chcp.fetchUpdate((error, data) => {
                        var result = error? this.generateErrorMessage(error): this.generateSuccessMessage(data);
                        r(result);
                    }, options);
                });
            }
            return this.generateErrorMessage('Cordova hot push plugin does not exist');
        } catch (error) {
            return this.generateErrorMessage(error);
        }
    }
    async autoupdateInstallLatestVersion(): Promise < any > {
        try {
            if (this.isCordovaUsed()) {
                const options = {
                    'config-file': this.getHotcodeUrl()
                };
                return new Promise((r) => {
                    window.chcp.installUpdate(error => {
                        var result = error? this.generateErrorMessage(error): this.generateSuccessMessage();
                        r(result);
                    }, options);
                })
            }
            return this.generateErrorMessage('Cordova hot push plugin does not exist');
        } catch (error) {
            return this.generateErrorMessage(error);
        }
    }
};