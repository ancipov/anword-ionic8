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
    ExportedClass as ApperySpeech
} from '../scripts/custom/ApperySpeech';
import {
    $aio_empty_object
} from '../scripts/interfaces';
import {
    ViewChild
} from '@angular/core';
@Component({
    standalone: false,
    templateUrl: 'speechrecognition.html',
    selector: 'page-speechrecognition',
    styleUrls: ['speechrecognition.css', 'speechrecognition.scss']
})
export class speechrecognition {
    public aioScreenName = "speechrecognition";
    public message: string;
    public languages: any;
    public lang: any;
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
    async recognize(): Promise < any > {
        if (!await this.apperySpeech.ensureReady()) return;
        let text = await this.$a.modal("speechrecognitionmodal", {
            lang: this.lang
        });
        if (text) this.message = text;
    }
    async ionViewWillEnter(): Promise < any > {
        try {
            await this.$v?.ionViewWillEnter?.call?.(this);
        } catch (e) {
            console.log(e);
        }
        document.documentElement.classList.toggle("aio-no-bounce", false);
        try {
            this.languages = await this.apperySpeech.getSupportedLanguages();
            if (this.languages?.length && !this.languages.includes(this.lang)) {
                this.lang = this.languages.includes('en-US')?
                'en-US': this.languages[0];
            }
        } catch (e) {
            await this.$a.showError(e);
        }
        window.currentScreen = this;
    }
    getLanguageLabel(code): any {
        return this.apperySpeech.getLanguageLabel(code);
    }
    constructor(public Apperyio: ApperyioHelperService, private $aio_mappingHelper: ApperyioMappingHelperService, private $aio_changeDetector: ChangeDetectorRef, public apperySpeech: ApperySpeech) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
        this.message = '';
        this.languages = [];
        this.lang = 'en-US';
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