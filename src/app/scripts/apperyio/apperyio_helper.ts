import {
    Injectable,
    Injector,
    ApplicationRef,
    NgZone
} from '@angular/core';
import {
    Router
} from '@angular/router';
import {
    ActionSheetController,
    AlertController,
    PickerController,
    MenuController,
    ModalController,
    PopoverController,
    LoadingController,
    ToastController,
    Platform
} from '@ionic/angular';
import {
    routes,
    projectInfo
} from '../constants';
import {
    EntityApiService
} from './entityapi_service';
import {
    ApperyioDataHelperService
} from './apperyio_data_helper';
import {
    ApperyioNativeHelperService
} from './apperyio_native_helper';
import {
    ApperyioPreloadHelperService
} from './apperyio_preload_helper';
import {
    ApperyioThemeHelperService
} from './apperyio_theme_helper';
import {
    ApperyioDataTableHelperService
} from './apperyio_datatable_helper';
import {
    ApperyioHotPushHelperService
} from './apperyio_hot_push_helper';
import {
    ApperyioDateTimeHelperService
} from './apperyio_datetime_helper';
import {
    ApperyioConfigService
} from './config_service';
import {
    ModalScreensService
} from './modal_screens_service';
import {
    DomSanitizer
} from '@angular/platform-browser';
import {
    ApperyioNavigationHelperService
} from './apperyio_navigation_helper';
import {
    ApperyioSocialLoginHelperService
} from './apperyio_social_login_helper';
import {
    ApperyioPWAHelperService
} from './apperyio_pwa_helper';
import {
    ApperyioUtilsService
} from './apperyio_utils';
import {
    TranslateService
} from '@ngx-translate/core';
import _ from "lodash";
import moment from "moment";
import {
    openai
} from "aio-openai";
// Mixins with Utils methods
import {
    UtilsCommon,
    UtilsCommonInterface
} from './utils/common';
import {
    UtilsDB,
    UtilsDBInterface
} from './utils/db';
import {
    UtilsHttp,
    UtilsHttpInterface
} from './utils/http';
import {
    UtilsAppClient,
    UtilsAppClientInterface
} from './utils/app_client';
import {
    UtilsSecureStorage,
    UtilsSecureStorageInterface
} from './utils/secure_storage';
import {
    AppClientGenericWrapperService
} from './appclient/appclient_generic_wrapper_service';
import {
    createComponent
} from '@angular/core';
import {
    HttpClient
} from '@angular/common/http';
import {
    Network
} from '@awesome-cordova-plugins/network/ngx';
interface Controllers {
    actionSheetController: ActionSheetController,
        alertController: AlertController,
        pickerController: PickerController,
        menuController: MenuController,
        modalController: ModalController,
        popoverController: PopoverController,
        loadingController: LoadingController,
        toastController: ToastController
}
let CustomLoadingComponent: any;
@Injectable()
export class ApperyioHelperService {
    public db: UtilsDBInterface = UtilsDB;
    public aex: UtilsAppClientInterface = UtilsAppClient;
    private servicesMap: {
        [name: string]: any
    };
    private _services: {
        [name: string]: any
    } = {};
    private controllers: Controllers = < Controllers > {};
    private isInPreview = false;
    private eruda;
    private _loadingComponentRef;
    public projectInfo = projectInfo;
    public vars: {
        [name: string]: any
    } = {};
    public internalSettings: {
        [name: string]: any
    } = {};
    public openai;
    public _ = _;
    public moment = moment;
    public isKeyboardOpen = false;
    public autoScroolIntoView = true;
    get path() {
        return this.router?.url?.substring(1);
    }
    constructor(
        private injector: Injector,
        private router: Router,
        private entityAPI: EntityApiService,
        private modalScreensSrv: ModalScreensService,
        private sanitizer: DomSanitizer,
        public data: ApperyioDataHelperService,
        public native: ApperyioNativeHelperService,
        public preload: ApperyioPreloadHelperService,
        public theme: ApperyioThemeHelperService,
        public user: ApperyioSocialLoginHelperService,
        public pwa: ApperyioPWAHelperService,
        public utils: ApperyioUtilsService,
        public hotPush: ApperyioHotPushHelperService,
        public dateTime: ApperyioDateTimeHelperService,
        public platform: Platform,
        public navigation: ApperyioNavigationHelperService,
        public http: HttpClient,
        public network: Network,
        private appRef: ApplicationRef,
        public dataTable: ApperyioDataTableHelperService,
        public config: ApperyioConfigService,
        public translate: TranslateService,
        private appClientGenericWrapperService: AppClientGenericWrapperService,
        public loadingController: LoadingController,
        public ngZone: NgZone
    ) {
        const context: any = {
            $a: this
        };
        this.data.init(context);
        this._addSourcesErrorCheck();
        this._fixKeyboardBug();
        this._setIsInPreview();
        this._disableDefaultSanitizer();
        this.vars = ( < any > this.data)._variables;
        context.$v = this.vars;
        this.initUtils();
        this.openai = openai;
        const openaiApiKey = this.config.get("Settings.openaiApiKey");
        if (openaiApiKey) {
            this.openai.init(openaiApiKey, this);
        }
        ( < any > window)._ = _;
        ( < any > window).moment = moment;
        if (window.cordova) {
            window.addEventListener('keyboardDidShow', () => {
                this.ngZone.run(() => {
                    this.isKeyboardOpen = true;
                });
                if (this.autoScroolIntoView) {
                    setTimeout(() => {
                        var el = document.activeElement;
                        el?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest'
                        })
                    }, 300);
                }
            });
            window.addEventListener('keyboardDidHide', () => {
                this.ngZone.run(() => {
                    this.isKeyboardOpen = false;
                });
            });
        } else {
            window.visualViewport?.addEventListener?.('resize', () => {
                // If the viewport has shrunk while an input is focused, the keyboard is open
                if (window.visualViewport.height < window.innerHeight) {
                    this.ngZone.run(() => {
                        this.isKeyboardOpen = true;
                    });
                    if (this.autoScroolIntoView) {
                        setTimeout(() => {
                            var el = document.activeElement;
                            el?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'nearest'
                            })
                        }, 300);
                    }
                } else {
                    this.ngZone.run(() => {
                        this.isKeyboardOpen = false;
                    });
                }
            });
        }
    }
    /** 
     * for preview add check when preview sources are unavailable (when app was changed and rebuild is needed)
     */
    private _addSourcesErrorCheck() {
        if (window.location.href.includes("appery.io/app/view/")) { // it's preview
            var id = "aio_reload_popup_" + ("" + Math.random()).substring(3, 10),
                popupHTML = `<style>.disablepagediv {z-index: 9999999999;position: absolute;top: 0;left: 0;bottom:0;right:0;background-color: rgba(0,0,0,0.5);}.masterpopup {width: 270px;position: absolute;color: #000000;background-color: #ffffff;top: 100px;left: 50%;margin-left: -135px;border: 1px solid rgb(124, 153, 193);font-size:16px;}</style><div id="popDiv" class="disablepagediv"><div class="masterpopup"><div style="height:25px;line-height:25px;background-color:var(--ion-color-primary, #3880ff);color:var(--ion-color-primary-contrast, #ffffff);padding-left:10px;">Warning!</div><div style="padding:20px;text-align:center;">Sources loading failed. Probably app was changed. Reload app?<br/><br/><input type="button" style="margin:5px" onClick="document.getElementById('${id}').remove()" value="Cancel" /><input type="button" style="margin:5px" onClick="window.location.reload()" value="OK" /></div></div></div>`;
            var errorFn = console.error;
            console.error = function(err) {
                var isChunkLoadError = false;
                for (var i = 0; i < arguments.length; i++) {
                    var err = arguments[i];
                    if (err && (
                            err.name === "ChunkLoadError" ||
                            err.message && err.message.indexOf &&
                            (/Loading chunk ?.+ failed/.test(err.message) || err.message.indexOf("ChunkLoadError") !== -1)
                        )) {
                        isChunkLoadError = true;
                        break;
                    }
                }
                if (isChunkLoadError) {
                    if (!document.getElementById(id)) {
                        var div = document.createElement("div");
                        div.id = id;
                        div.innerHTML = popupHTML;
                        document.body.append(div);
                        document.documentElement.classList.add("hydrated");
                    }
                }
                errorFn.apply(console, arguments);
            }
        }
    }
    private _fixKeyboardBug() {
        this.platform.ready().then(() => {
            if (!window.cordova) {
                this.platform.keyboardDidShow.subscribe(ev => {
                    document.body.classList.add("aio-keyboard-open");
                    document.body.style?.setProperty?.('--aio-keyboard-offset', ev.keyboardHeight + 'px');
                });
                this.platform.keyboardDidHide.subscribe(() => {
                    document.body.classList.remove("aio-keyboard-open");
                });
            }
        });
    }
    private _setIsInPreview() {
        let isInPreview = false;
        try {
            if (window !== window.top && (/\/shared.*\.html/.test(window.top.location.pathname) || '/app/mobile-frame' === window.top.location.pathname)) {
                isInPreview = true;
            }
        } catch (e) {
            isInPreview = true;
        }
        this.isInPreview = isInPreview;
    }
    /** 
     * DompurifySanitizer is used in the project
     */
    private _disableDefaultSanitizer() {
        this.sanitizer.bypassSecurityTrustResourceUrl = (val) => val;
    }
    private async _importServices() {
        let services = await
        import ('../services');
        this.servicesMap = services.services;
    }
    setThinScrollIfNeeded() {
        if (this.isInPreview) {
            const id = "_aio_scroll_styles";
            let style;
            const globStyle = document.getElementById(id);
            if (!globStyle) {
                style = document.createElement("style");
                style.textContent =
                    "@media only screen and (max-width: 395px) and (max-height: 860px) {" +
                    ":root[mode=ios] {" +
                    "--ion-safe-area-top: 47px;" +
                    "--ion-safe-area-bottom: 34px;" +
                    "}";
                style.setAttribute("id", id);
                document.head.appendChild(style);
            }
            let ionContents = document.getElementsByTagName("ion-content");
            for (var i = 0; i < ionContents.length; i++) {
                const shadowRoot = ionContents[i].shadowRoot;
                if (!shadowRoot.getElementById(id)) {
                    style = document.createElement("style");
                    style.textContent =
                        ".inner-scroll::-webkit-scrollbar {" +
                        "width: 9px;" +
                        "}" +
                        ".inner-scroll::-webkit-scrollbar-track {" +
                        "background: rgba(255, 255, 255, 0.2);" +
                        "}" +
                        ".inner-scroll::-webkit-scrollbar-thumb {" +
                        "background: rgb(180, 180, 180);" +
                        "border-radius: 5px;" +
                        "border: 2px rgba(0, 0, 0, 0) solid;" +
                        "background-clip: padding-box;" +
                        "cursor: pointer;" +
                        "}";
                    style.setAttribute("id", id);
                    shadowRoot.appendChild(style);
                }
            }
        }
    }
    // router/navigation
    navigateTo(...options: any[]): Promise < any > {
        if (routes[options[0]]) {
            let url = < string > routes[options[0]];
            if (url[0] !== "." && url[0] !== "/") {
                url = "/" + url;
            }
            let optionalIndex = url.indexOf("/:");
            if (optionalIndex !== -1) {
                url = url.substring(0, optionalIndex);
            }
            options[0] = url;
        }
        return this.router.navigate(options);
    }
    getRouteParam(paramName: string) {
        let children = this.router.routerState.snapshot.root.children[0];
        while (children && children.params) {
            if (children.params[paramName] !== undefined) {
                return children.params[paramName];
            }
            children = children.children?.[0];
        }
    }
    getQueryParam(paramName: string) {
        return this.router.routerState.snapshot.root.queryParams[paramName];
    }
    // services
    async getService(name: string): Promise < any > {
        if (!this.servicesMap) {
            await this._importServices();
        }
        if (!this._services[name] && this.servicesMap[name]) {
            this._services[name] = this.injector.get < any > (this.servicesMap[name]);
        }
        return this._services[name];
    }
    // controllers
    getController(name: string): any {
        if (this.controllers[name]) {
            return this.controllers[name];
        }
        switch (name) {
            case "ActionSheetController":
                this.controllers[name] = this.injector.get < ActionSheetController > (ActionSheetController);
                break;
            case "AlertController":
                this.controllers[name] = this.injector.get < AlertController > (AlertController);
                break;
            case "PickerController":
                this.controllers[name] = this.injector.get < PickerController > (PickerController);
                break;
            case "MenuController":
                this.controllers[name] = this.injector.get < MenuController > (MenuController);
                break;
            case "ModalController":
                this.controllers[name] = this.injector.get < ModalController > (ModalController);
                break;
            case "PopoverController":
                this.controllers[name] = this.injector.get < PopoverController > (PopoverController);
                break;
            case "LoadingController":
                this.controllers[name] = this.injector.get < LoadingController > (LoadingController);
                break;
            case "ToastController":
                this.controllers[name] = this.injector.get < ToastController > (ToastController);
                break;
            default:
                console.log(`ApperyioService. Controller ${name} not supported`)
                return;
        }
        return this.controllers[name];
    }
    // modal
    async showModal(screenName: string, options?: any): Promise < any > {
        if (!options) {
            options = {};
        }
        if (!screenName && !options.component) {
            console.log("ApperyioService showModal method: screenName missed");
            return
        }
        if (!options.component && screenName) {
            options.component = await this.modalScreensSrv.getModalScreen(screenName);
        }
        if (!options.component) {
            console.log("ApperyioService showModal method: nonexistent modal component");
            return
        }
        options.cssClass = (options.cssClass?(options.cssClass + " "): "") + "aio_modal_" + screenName;
        const modalController = this.getController("ModalController");
        const modal = await modalController.create(options);
        return modal;
    }
    async dismissLoading(): Promise < void > {
        this._loadingComponentRef?.destroy();
        while (await this.loadingController.getTop() !== undefined) {
            try {
                await this.loadingController.dismiss();
                await ( < any > this).timeout(10);
            } catch (e) {
                console.log(e);
            }
        }
    }
    async showLoading(message = 'Please wait...', spinner: any = 'crescent'): Promise < any > {
        await this.dismissLoading();
        const loading = await this.loadingController.create({
            spinner: null, // hide standard spinner
            message: '<div id="aio-custom-loader-container"></div>',
            cssClass: 'aio-custom-loader-overlay'
        });
        await loading.present();
        // after present() container is already in the DOM
        const container = document.getElementById('aio-custom-loader-container');
        if (container) {
            if (!CustomLoadingComponent) {
                CustomLoadingComponent = (await
                    import ('../../custom_component/AioCustomLoading/AioCustomLoading')).AioCustomLoading;
            }
            if (CustomLoadingComponent) {
                this._loadingComponentRef?.destroy?.();
                // create Angular-component manualy
                this._loadingComponentRef = createComponent(CustomLoadingComponent, {
                    environmentInjector: this.appRef.injector,
                });
                // bind it with Angular change detection
                this.appRef.attachView(this._loadingComponentRef.hostView);
                container.appendChild(this._loadingComponentRef.location.nativeElement);
            }
        }
        return loading;
    }
    entityAPIGet(name: string, defaults?: any, default_undefined?: boolean, skip_empty_objects?: boolean): any {
        return this.entityAPI.get(name, defaults, default_undefined, skip_empty_objects);
    }
    execDataService(context: any, serviceName: string, cb?: Function): void {
        let func = context.$aio_dataServices[serviceName];
        if (func) {
            context[func](cb);
        } else {
            console.log("Service \"" + serviceName + "\" not found");
        }
    }
    async getGSNameByImpl(srv: any): Promise < string > {
        if (!srv) return;
        let srvClass = srv.constructor || srv;
        if (!this.servicesMap) {
            await this._importServices();
        }
        if (this.servicesMap) {
            let keys = Object.keys(this.servicesMap);
            for (let i = 0; i < keys.length; i++) {
                if (this.servicesMap[keys[i]] === srvClass) {
                    return keys[i];
                }
            }
        }
    }
    isAndroid(): boolean {
        return this.platform.is('android');
    }
    isIOS(): boolean {
        return this.platform.is('ios');
    }
    isMobile(): boolean {
        if (location.href.includes("hot_reload=true") || location.href.includes("preview_build=true")) {
            return true;
        }
        return this.platform.is('cordova');
    }
    isBrowser(): boolean {
        return !this.isMobile();
    }
    private _toggleDebugConsole(show?: boolean) {
        const style = show? "all:initial": "display:none";
        if (this.eruda) {
            const container: any = this.eruda._container;
            container.style.cssText = style;
            const styleDiv: any = document.getElementsByClassName("__chobitsu-hide__");
            if (styleDiv && styleDiv.length) {
                styleDiv[styleDiv.length - 1].style.cssText = style;
            }
        } else {
            console.warn('Console debugger is not enabled in the application. Enable it in App Settings.');
        }
    }
    showDebugConsole() {
        this._toggleDebugConsole(true);
    }
    hideDebugConsole() {
        this._toggleDebugConsole(false);
    }
};
applyMixins(ApperyioHelperService, [UtilsCommon, UtilsHttp, UtilsSecureStorage]);

function applyMixins(derivedCtor: any, constructors: any[]) {
    constructors.forEach((baseCtor) => {
        let source = baseCtor.prototype || baseCtor;
        Object.getOwnPropertyNames(source).forEach((name) => {
            Object.defineProperty(
                derivedCtor.prototype,
                name,
                Object.getOwnPropertyDescriptor(source, name) || Object.create(null)
            );
        });
    });
}
export interface ApperyioHelperService extends UtilsCommonInterface, UtilsHttpInterface, UtilsSecureStorageInterface {}