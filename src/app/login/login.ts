import {
    Component
} from '@angular/core';
import {
    ChangeDetectorRef
} from '@angular/core';
import {
    ApperyioHelperService
} from '../scripts/apperyio/apperyio_helper';
import {
    ApperyioMappingHelperService
} from '../scripts/apperyio/apperyio_mapping_helper';
import {
    $aio_empty_object
} from '../scripts/interfaces';
import {
    ViewChild
} from '@angular/core';
@Component({
    standalone: false,
    templateUrl: 'login.html',
    selector: 'page-login',
    styleUrls: ['login.css', 'login.scss']
})
export class login {
    public aioScreenName = "login";
    public autoLogin: boolean;
    public user: any;
    public isBiometricAvailable: boolean;
    public loaded: any;
    public subscriber: any;
    public $a: ApperyioHelperService;
    public $v: {
        [name: string]: any
    };
    public aioChangeDetector: ChangeDetectorRef;
    public currentItem: any = null;
    private _aioPrevNoBounce = false;
    @ViewChild('_aio_content') _aio_content;
    public _aioDelayLoaded = true;
    public mappingData: any = {};
    public __getMapping(_currentItem, property, defaultValue, isVariable?, isSelected?) {
        return this.$aio_mappingHelper.getMapping(this.mappingData, _currentItem, property, defaultValue, isVariable, isSelected);
    }
    public __isPropertyInMapping(_currentItem, property) {
        return this.$aio_mappingHelper.isPropertyInMapping(this.mappingData, _currentItem, property);
    }
    public __setMapping(data: any = {}, keyName: string, propName?: string): void {
        const changes = data.detail || {};
        if (propName) {
            this.mappingData = this.$aio_mappingHelper.updateData(this.mappingData, [keyName], changes[propName]);
        } else {
            this.mappingData = this.$aio_mappingHelper.updateData(this.mappingData, [keyName], changes.value);
        }
        this.$aio_changeDetector.detectChanges();
    }
    public __bindedMethods: any = {};
    @ViewChild('loginForm', {
        static: true
    }) public loginForm;
    async ngOnInit(): Promise < any > {
        setTimeout(() => this._aioDelayLoaded = false, 2000);
        await this.checkTheNewStoreVersion();
        if (this.$a.getLocal("autoLogin")) {
            await this.$a.showLoading();
            this.user = await this.$a.ssGet('savedUser_' + this.$a.projectInfo?.guid) || {};
            const result = await this.$a.sc('loginScriptId', {
                ...this.user,
                ...window?.device
            }, {
                showError: false
            });
            if (!result) this.user.password = '';
            if (result?.status == 'active') {
                await this.$v.saveUserDataAndNavigate(result);
            } else this.$a.setLocal("autoLogin", false);
            await this.$a.dismissLoading();
        }
        this.loaded = true;
        if (!this.$a.isMobile()) {
            this.subscriber = this.$v.authService.authState.subscribe(async (user) => {
                if (user) {
                    if (user.provider == "GOOGLE") {
                        await this.$a.showLoading();
                        let result = await this.$a.sc("googleLoginScriptId", user);
                        if (result) {
                            await this.$v.saveUserDataAndNavigate(result);
                        }
                        await this.$a.dismissLoading();
                    }
                }
            });
        }
        this.Apperyio.setThinScrollIfNeeded();
    }
    async ionViewWillEnter(): Promise < any > {
        try {
            await this.$v?.ionViewWillEnter?.call?.(this);
        } catch (e) {
            console.log(e);
        }
        document.documentElement.classList.toggle("aio-no-bounce", false);
        try {
            this.isBiometricAvailable = await this.$v.checkBiometric();
            this.user = {};
        } catch (e) {
            await this.$a.showError(e);
        }
        window.currentScreen = this;
    }
    ionViewDidLeave(): any {
        this.subscriber?.unsubscribe?.();
    }
    async login(): Promise < any > {
        try {
            if (true) {
                let formId = this._aio_content?.el?.querySelector?.("form[viewchild_name]")?.getAttribute('viewchild_name');
                if (formId && this[formId]) {
                    if (this.$a.markFormAsTouched(this[formId])) return;
                }
            }
            await this.doLogin();
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    async doLogin(): Promise < any > {
        try {
            await this.$a.showLoading();
            const result = await this.$a.sc('loginScriptId', {
                ...this.user,
                ...window?.device
            });
            if (!result) return await this.$a.dismissLoading();
            if (result.status == 'active') {
                await this.$v.saveAutologinData(this.autoLogin, this.user);
                await this.$v.saveUserDataAndNavigate(result);
            } else if (result.status == 'unconfirmed') {
                await this.$a.dismissLoading();
                await this.$a.alertAsync("User account is not confirmed", "Login");
                this.$v.user = {
                    _id: result._id
                };
                this.$a.navigation.root("code", [], {
                    replaceUrl: true
                });
                this.$v.showCodeAlert(result?.confirmationType == 'NONE');
            } else {
                await this.$a.alert(this.$a.translate.instant("Unknown status: ") + result.status, "Login");
            }
        } catch (e) {
            await this.$a.showError(e);
        }
        await this.$a.dismissLoading();
    }
    async googleLogin(): Promise < any > {
        let user = await this.$a.native.googlePlus.login({});
        user = this.$v.safeParse(user);
        await this.$a.showLoading();
        let result = await this.$a.sc("googleLoginScriptId", user);
        if (result) await this.$v.saveUserDataAndNavigate(result);
        else this.$a.showError(result);
        await this.$a.dismissLoading();
    }
    async biometricLogin(): Promise < any > {
        try {
            if (!await this.$v.biometricLogin()) return;
            const user = await this.$a.ssGet('savedUser_' + this.$a.projectInfo?.guid);
            if (!user) return;
            this.user = user;
            await this.doLogin();
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    async checkTheNewStoreVersion(): Promise < any > {
        try {
            if (this.$a.offline || this.$a.isBrowser()) return;
            const config = await this.$a.sc('configScriptId', {
                device: window.device,
                buildInfo: window.BuildInfo
            });
            if (!config?.storeUpdateRequered) return;
            await this.$a.alert("Application should be updated from the Store", "New version", () => {
                if (this.$a.isAndroid()) window.open("https://play.google.com/store/apps/details?id=" + window.BuildInfo?.packageName, "_system");
                else window.open("itms-apps://itunes.apple.com/us/app/myapp/" + this.$a.getConfig("iosBundleId"), "_system");
                return false;
            });
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    constructor(public Apperyio: ApperyioHelperService, private $aio_mappingHelper: ApperyioMappingHelperService, private $aio_changeDetector: ChangeDetectorRef) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
        this.user = {};
        this.isBiometricAvailable = false;
        this.loaded = false;
        this.aioChangeDetector = this.$aio_changeDetector;
    }
    ionViewWillLeave() {
        try {
            this.$v?.ionViewWillLeave?.call?.(this);
        } catch (e) {
            console.log(e);
        }
    }
}