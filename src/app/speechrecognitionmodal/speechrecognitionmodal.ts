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
    Observable
} from 'rxjs';
import {
    ExportedClass as ApperySpeech
} from '../scripts/custom/ApperySpeech';
import {
    SpeechRecognition
} from '@awesome-cordova-plugins/speech-recognition/ngx';
import {
    timeout
} from 'rxjs/operators';
import {
    $aio_empty_object
} from '../scripts/interfaces';
import {
    ViewChild
} from '@angular/core';
@Component({
    standalone: false,
    templateUrl: 'speechrecognitionmodal.html',
    selector: 'page-speechrecognitionmodal',
    styleUrls: ['speechrecognitionmodal.css', 'speechrecognitionmodal.scss']
})
export class speechrecognitionmodal {
    public aioScreenName = "speechrecognitionmodal";
    public text: string;
    public lang: string;
    public time: number;
    public stopped: any;
    public expectedText: any;
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
        this._aioPrevNoBounce = document.documentElement.classList.contains("aio-no-bounce");
        document.documentElement.classList.toggle("aio-no-bounce", false);
        this.stopped = false;
        this.text = this.text || '';
        await this.apperySpeech.start({
            lang: this.lang,
            silenceMs: this.time,
            onResult: async (text) => {
                this.text = text;
                this.aioChangeDetector.detectChanges();
                if (this.text?.toUpperCase() == this.expectedText?.toUpperCase()) await this.stop();
            },
            onSilence: () => {
                this.stop();
            },
            onFatalError: async (message) => {
                await this.$a.alert(message);
                this.stop();
            }
        });
        window.parentCurrentScreen = window.currentScreen;
        window.currentScreen = this;
    }
    async stop(): Promise < any > {
        if (this.stopped) return;
        this.stopped = true;
        this.text = await this.apperySpeech.stop();
        this.$a.closeModal(this.text);
    }
    constructor(public Apperyio: ApperyioHelperService, private $aio_mappingHelper: ApperyioMappingHelperService, private $aio_changeDetector: ChangeDetectorRef, public apperySpeech: ApperySpeech) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
        this.text = '';
        this.lang = 'en-US';
        this.time = 4000;
        this.aioChangeDetector = this.$aio_changeDetector;
    }
    ngOnInit() {
        this.Apperyio.setThinScrollIfNeeded();
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