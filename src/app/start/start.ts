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
    templateUrl: 'start.html',
    selector: 'page-start',
    styleUrls: ['start.css', 'start.scss']
})
export class start {
    public aioScreenName = "start";
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
    async ngOnInit(): Promise < any > {
        try {
            await this.$a.showLoading();
            let savedUser = await this.$a.ssGet('savedUser_' + this.$a.projectInfo?.guid);
            if (!savedUser) savedUser = await this.createAnonymousUser();
            const result = await this.$a.sc('loginScriptId', {
                ...savedUser,
                ...window?.device
            });
            if (!result) {
                savedUser = await this.createAnonymousUser();
                const result = await this.$a.sc('loginScriptId', {
                    ...savedUser,
                    ...window?.device
                });
            }
            await this.$v.saveUserDataAndNavigate(result);
        } catch (e) {
            await this.$a.showError(e);
        }
        await this.$a.dismissLoading();
        this.Apperyio.setThinScrollIfNeeded();
    }
    async createAnonymousUser(): Promise < any > {
        let savedUser = {
            username: "anonymous_" + Date.now() + '@appery.io',
            password: this.$a.generateUUID(),
            firstName: 'anonymous',
            lastName: 'anonymous',
            anonymous: true
        };
        const result = await this.$a.sc('signupScriptId', savedUser);
        await this.$a.ssSet('savedUser_' + this.$a.projectInfo?.guid, savedUser);
        return savedUser;
    }
    constructor(public Apperyio: ApperyioHelperService, private $aio_mappingHelper: ApperyioMappingHelperService, private $aio_changeDetector: ChangeDetectorRef) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
        this.aioChangeDetector = this.$aio_changeDetector;
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