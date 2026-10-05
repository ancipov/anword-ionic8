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
    templateUrl: 'settings.html',
    selector: 'page-settings',
    styleUrls: ['settings.css', 'settings.scss']
})
export class settings {
    public aioScreenName = "settings";
    public version: string;
    public isBiometricAvailable: any;
    public settings: any;
    public $a: ApperyioHelperService;
    public $v: {
        [name: string]: any
    };
    public aioChangeDetector: ChangeDetectorRef;
    public currentItem: any = null;
    private _aioPrevNoBounce = false;
    @ViewChild('_aio_content') _aio_content;
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
    async ionViewWillEnter(): Promise < any > {
        try {
            await this.$v?.ionViewWillEnter?.call?.(this);
        } catch (e) {
            console.log(e);
        }
        document.documentElement.classList.toggle("aio-no-bounce", false);
        try {
            this.isBiometricAvailable = await this.$v.checkBiometric();
            const autoupdateData = await this.$a.hotPush.getAutoupdateVersion();
            if (autoupdateData?.status === "Success" && autoupdateData.data?.currentWebVersion) {
                this.version = autoupdateData.data.currentWebVersion;
            };
            this.settings = await this.$a.getStorage('settings');
            if (!this.settings) this.settings = {};
        } catch (e) {
            await this.$a.showError(e);
        }
        window.currentScreen = this;
    }
    async changeDarkMode(): Promise < any > {
        try {
            //this.$a.setTheme(this.$v.settings.darkMode ? 'Dark' : 'Default');
            await this.$a.setStorage("settings", this.$v.settings);
            await this.$v.applyDefaultSettings();
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    async changeLang(): Promise < any > {
        try {
            //this.$a.setLang(this.$v.settings.lang);
            await this.$a.setStorage("settings", this.$v.settings);
            await this.$v.applyDefaultSettings();
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    async removeUser(): Promise < any > {
        try {
            if (!await this.$a.alertOkCancelAsync("Are you sure?", "User will be removed")) return;
            const result = await this.$a.sc('removeUserScriptId', {
                fileName: this.$v.profile?.avatar?.fileName,
                uuid: window.device?.uuid
            }, {
                message: "All your data was removed"
            });
            if (!result) return;
            this.$v.logout();
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    async changeBiometricLogin(): Promise < any > {
        try {
            await this.$a.setStorage("settings", this.$v.settings);
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    async saveSettings(): Promise < any > {
        await this.$a.setStorage('settings', this.settings);
    }
    constructor(public Apperyio: ApperyioHelperService, private $aio_mappingHelper: ApperyioMappingHelperService, private $aio_changeDetector: ChangeDetectorRef) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
        this.settings = {};
        this.aioChangeDetector = this.$aio_changeDetector;
    }
    ngOnInit() {
        this.Apperyio.setThinScrollIfNeeded();
    }
    ionViewWillLeave() {
        try {
            this.$v?.ionViewWillLeave?.call?.(this);
        } catch (e) {
            console.log(e);
        }
    }
}