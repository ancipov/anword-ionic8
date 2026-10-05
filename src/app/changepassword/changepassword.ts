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
    templateUrl: 'changepassword.html',
    selector: 'page-changepassword',
    styleUrls: ['changepassword.css', 'changepassword.scss']
})
export class changepassword {
    public aioScreenName = "changepassword";
    public newPassword: any;
    public password: any;
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
    @ViewChild('form', {
        static: true
    }) public form;
    async save(): Promise < any > {
        try {
            if (true) {
                let formId = this._aio_content?.el?.querySelector?.("form[viewchild_name]")?.getAttribute('viewchild_name');
                if (formId && this[formId]) {
                    if (this.$a.markFormAsTouched(this[formId])) return;
                }
            }
            const res = await this.$a.sc('changePasswordScriptId', {
                password: this.password,
                newPassword: this.newPassword
            }, {
                loading: true,
                message: 'Password was changed'
            });
            if (!res) return;
            if (this.$a.getLocal("autoLogin")) {
                let savedUser = await this.$a.ssGet('savedUser_' + this.$a.projectInfo?.guid);
                await this.$a.ssSet('savedUser_' + this.$a.projectInfo?.guid, {
                    username: this.$v.user.username,
                    password: this.newPassword
                });
            }
            this.$a.closeModal();
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    constructor(public Apperyio: ApperyioHelperService, private $aio_mappingHelper: ApperyioMappingHelperService, private $aio_changeDetector: ChangeDetectorRef) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
        this.aioChangeDetector = this.$aio_changeDetector;
    }
    ngOnInit() {
        this.Apperyio.setThinScrollIfNeeded();
    }
    ionViewWillEnter() {
        this._aioPrevNoBounce = document.documentElement.classList.contains("aio-no-bounce");
        window.parentCurrentScreen = window.currentScreen;
        document.documentElement.classList.toggle("aio-no-bounce", false);
        window.currentScreen = this;
        try {
            this.$v?.ionViewWillEnter?.call?.(this);
        } catch (e) {
            console.log(e);
        }
    }
    ionViewWillLeave() {
        document.documentElement.classList.toggle("aio-no-bounce", this._aioPrevNoBounce);
        try {
            this.$v?.ionViewWillLeave?.call?.(this);
        } catch (e) {
            console.log(e);
        }
    }
    ionViewDidLeave() {
        window.currentScreen = window.parentCurrentScreen;
        delete window.parentCurrentScreen;
    }
}