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
    templateUrl: 'forgotpassword.html',
    selector: 'page-forgotpassword',
    styleUrls: ['forgotpassword.css', 'forgotpassword.scss']
})
export class forgotpassword {
    public aioScreenName = "forgotpassword";
    public code: string;
    public password: any;
    public username: any;
    public stage: number;
    public userId: any;
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
    ionViewWillEnter(): any {
        try {
            this.$v?.ionViewWillEnter?.call?.(this);
        } catch (e) {
            console.log(e);
        }
        document.documentElement.classList.toggle("aio-no-bounce", false);
        try {
            this.stage = 0;
        } catch (e) {
            this.$a.showError(e);
        }
        window.currentScreen = this;
    }
    async getCode(): Promise < any > {
        try {
            if (true) {
                let formId = this._aio_content?.el?.querySelector?.("form[viewchild_name]")?.getAttribute('viewchild_name');
                if (formId && this[formId]) {
                    if (this.$a.markFormAsTouched(this[formId])) return;
                }
            }
            const result = await this.$a.sc('resetPasswordCheckUsernameScriptId', {
                username: this.username
            }, {
                loading: true
            });
            if (!result) return;
            this.userId = result._id;
            this.stage++;
            if (result?.confirmationType == 'NONE') this.$a.alert(`You didn't configure SMTP or SMS server settings. Please add corresponding settings to the StarterLib server code. Dev confirmation code: 12345`, 'Warning');
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    async onCodeCompleted(code): Promise < any > {
        try {
            if (this.code == code) return;
            this.code = code;
            const result = await this.$a.sc('confirmationCodeScriptId', {
                username: this.username,
                code: this.code,
                codeType: "resetPassword",
            }, {
                loading: true
            });
            if (!result) return this.code = '';
            this.stage++;
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    async resendCode(): Promise < any > {
        try {
            const result = await this.$a.sc('resendCodeScriptId', {
                userId: this.userId,
                codeType: "resetPassword"
            }, {
                message: "Code was sent",
                loading: true
            });
            if (result?.confirmationType == 'NONE') this.$a.alert(`You didn't configure SMTP or SMS server settings. Please add corresponding settings to the StarterLib server code. Dev confirmation code: 12345`, 'Warning');
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    async setPassword(): Promise < any > {
        try {
            if (true) {
                let formId = this._aio_content?.el?.querySelector?.("form[viewchild_name]")?.getAttribute('viewchild_name');
                if (formId && this[formId]) {
                    if (this.$a.markFormAsTouched(this[formId])) return;
                }
            }
            const result = await this.$a.sc('resetPasswordSetPasswordScriptId', {
                username: this.username,
                code: this.code,
                password: this.password
            }, {
                message: "Password was changed",
                loading: true
            });
            if (result) this.$a.navigation.root('login', [], {
                replaceUrl: true
            });
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    constructor(public Apperyio: ApperyioHelperService, private $aio_mappingHelper: ApperyioMappingHelperService, private $aio_changeDetector: ChangeDetectorRef) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
        this.code = '';
        this.stage = 0;
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