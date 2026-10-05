import {
    Component
} from '@angular/core';
import {
    ChangeDetectorRef
} from '@angular/core';
import {
    ApperyioHelperService
} from './scripts/apperyio/apperyio_helper';
import {
    ApperyioMappingHelperService
} from './scripts/apperyio/apperyio_mapping_helper';
import {
    MenuController
} from '@ionic/angular';
import {
    NavController
} from '@ionic/angular';
import {
    Platform
} from '@ionic/angular';
import {
    ViewChild
} from '@angular/core';
import {
    Router
} from '@angular/router';
import {
    SplashScreen
} from '@awesome-cordova-plugins/splash-screen/ngx';
import {
    StatusBar
} from '@awesome-cordova-plugins/status-bar/ngx';
import {
    SocialAuthService
} from '@abacritt/angularx-social-login';
import {
    NgZone
} from '@angular/core';
import {
    $aio_empty_object
} from './scripts/interfaces';
@Component({
    standalone: false,
    templateUrl: 'app.html',
    selector: 'app-root',
    styleUrls: ['app.css', 'app.scss']
})
export class app {
    public aioScreenName = "app";
    public deviceType: string = 'web-browser';
    public hideMenuPages: any;
    public hideMenu: boolean;
    public menuExpand: boolean;
    public $a: ApperyioHelperService;
    public $v: {
        [name: string]: any
    };
    public aioChangeDetector: ChangeDetectorRef;
    public currentItem: any = null;
    private _aioPrevNoBounce = false;
    @ViewChild('_aio_content') _aio_content;
    public mappingData: any = {
        "j_356__visible": false,
        "j_368__visible": false,
        "j_363__visible": false,
    };
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
    constructor(public Apperyio: ApperyioHelperService, private $aio_mappingHelper: ApperyioMappingHelperService, private $aio_changeDetector: ChangeDetectorRef, public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, public menuCtrl: MenuController, public authService: SocialAuthService, public ngZone: NgZone) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
        this.hideMenuPages = ['login', 'code', 'initialsetup', 'signup', 'forgotpassword', 'privacypolicy', 'termsofservices', 'removeaccount'];
        this.hideMenu = false;
        this.menuExpand = true;
        this.aioChangeDetector = this.$aio_changeDetector;
        this.deviceType = window.cordova? 'mobile': 'web-browser';
        // this language will be used as a fallback when a translation isn't found in the current language 
        this.Apperyio.translate.setDefaultLang('en');
        // the lang to use, if the lang isn't available, it will use the current loader to get them 
        this.$a.setLang('en');
        // do not remove this code unless you know what you do
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            this.statusBar.styleDefault();
            this.splashScreen.hide();
            if (window.cordova?.InAppBrowser?.open) window.open = cordova.InAppBrowser.open;
            window.StatusBar?.show();
            // window.AndroidEdgeToEdge?.enable({
            //     lightStatusBar: true,
            //     lightNavigationBar: true,
            //     backgroundColor: '#FFFFFF',
            //     // Optional: packages to ignore (prevents issues with plugins like camera)
            //     ignoredPackages: [
            //         'org.apache.cordova.camera',
            //         'org.apache.cordova.file'
            //     ]
            // });
        });
        let skipStatusBarFixes;
        this.platform.ready().then(() => {
            if (!skipStatusBarFixes && this.$a.isAndroid() && this.$a.isMobile()) {
                if (!window.AndroidEdgeToEdge && window.StatusBar?.isVisible) {
                    window.StatusBar?.overlaysWebView?.(false);
                }
                if (window.StatusBar?.isVisible || window.AndroidEdgeToEdge && !window.StatusBar?.isVisible) {
                    window.document.documentElement.style.setProperty('--ion-safe-area-top', '0');
                }
                this.$a.theme.set(this.$a.theme.getCurrent() || "Default", true);
            }
        });
    }
    async ngOnInit(): Promise < any > {
        this.showOfflineHeader(this.$a.offline);
        this.$a._.merge(this.$v, this.$a.getSession("$v"));
        await this.$v.applyDefaultSettings();
        this.$v.authService = this.authService;
        this.$v.ngZone = this.ngZone;
        let currentState, toast;
        this.$a.onNetworkStateChange(async (state) => {
            if (state == currentState) return;
            currentState = state;
            //        this.showOfflineHeader(state != 'online');
            if (state == 'offline') {
                toast = await this.$a.toast("Application goes offline", "Internet connection", {
                    color: 'warning',
                    position: 'top',
                    duration: 0,
                    buttons: [{
                        text: 'Close'
                    }]
                });
            } else {
                await toast?.dismiss();
                this.$a.toast("Application goes online", "Internet connection", {
                    position: 'top'
                });
            }
        });
        this.$a.preload.components(["ion-input", "ion-modal", "ion-textarea", "ion-toast", "ion-datetime", "ion-select", "ion-popover", "ion-item"]);
        this.Apperyio.setThinScrollIfNeeded();
    }
    async logout(): Promise < any > {
        if (!await this.$a.alertOkCancelAsync("Are you sure?", "Logout")) return;
        await this.$v.fullLogout();
    }
    toggleMenu(): any {
        this.menuExpand = !this.menuExpand;
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 1100);
    }
    showOfflineHeader(offline): any {
        let elements = document.getElementsByClassName("aio-offline-header");
        while (elements[0]) elements[0].remove();
        if (!offline) return;
        let div = document.createElement('div');
        div.className = 'aio-offline-header';
        div.style['z-index'] = 9999;
        div.style['text-align'] = 'center';
        div.style['margin-top'] = 'calc(env(safe-area-inset-top) + 10px)';
        div.style['width'] = '100px';
        div.style['position'] = 'absolute';
        div.style['right'] = '0';
        div.style['margin-right'] = '40px';
        div.style['border-style'] = 'solid';
        div.style['border-width'] = '1px';
        div.style['border-color'] = 'var(--ion-color-primary)';
        div.style['background-color'] = 'var(--ion-color-warning)';
        div.style['border-radius'] = '5px';
        div.innerHTML = `Offline`;
        let ionApp = document.getElementsByTagName("ion-app")[0];
        ionApp?.appendChild(div);
    }
    async switchUser(): Promise < any > {
        await this.$v.fullLogout(true);
    }
    ionViewWillEnter() {
        document.documentElement.classList.toggle("aio-no-bounce", false);
        window.currentScreen = this;
        try {
            this.$v?.ionViewWillEnter?.call?.(this);
        } catch (e) {
            console.log(e);
        }
    }
    ionViewWillLeave() {
        try {
            this.$v?.ionViewWillLeave?.call?.(this);
        } catch (e) {
            console.log(e);
        }
    }
}