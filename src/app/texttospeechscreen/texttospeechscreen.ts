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
    ExportedClass as ApperyTTS
} from '../scripts/custom/ApperyTTS';
import {
    $aio_empty_object
} from '../scripts/interfaces';
import {
    ViewChild
} from '@angular/core';
@Component({
    standalone: false,
    templateUrl: 'texttospeechscreen.html',
    selector: 'page-texttospeechscreen',
    styleUrls: ['texttospeechscreen.css', 'texttospeechscreen.scss']
})
export class texttospeechscreen {
    public aioScreenName = "texttospeechscreen";
    public text: any;
    public lang: any;
    public locale: any;
    public identifier: any;
    public rate: any;
    public pitch: any;
    public volume: any;
    public cancel: any;
    public status: any;
    public selectedLanguage: any;
    public selectedVoice: any;
    public languages: any;
    public voices: any;
    public filteredVoices: any;
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
        if (!this.rate) this.rate = this.$a.isMobile() && this.$a.isIOS()? 0.5: 1;
        this.loadTtsData(0);
        this.Apperyio.setThinScrollIfNeeded();
    }
    async speak(): Promise < any > {
        this.status = 'Speaking...';
        try {
            await this.apperyTTS.speak({
                text: this.text,
                locale: this.selectedLanguage,
                identifier: this.selectedVoice || undefined,
                rate: Number(this.rate),
                cancel: true
            });
            this.status = 'Done';
        } catch (e) {
            console.log(e);
            this.status = 'Error: ' + (e && e.message? e.message: e);
        }
    }
    async loadTtsData(attempt): Promise < any > {
        try {
            const [languages, voices] = await Promise.all([
                this.apperyTTS.getLanguages(),
                this.apperyTTS.getVoices()
            ]);
            if ((!voices || !voices.length) && attempt < 5) {
                setTimeout(() => this.loadTtsData(attempt + 1), 400);
                return;
            }
            this.languages = languages && languages.length? languages: this.languages;
            this.voices = voices || [];
            if (this.languages.indexOf(this.selectedLanguage) === -1) {
                this.selectedLanguage = this.languages[0];
            }
            this.onLanguageChange();
            this.status = `Loaded ${this.languages.length} languages, ${this.voices.length} voices`;
            this.aioChangeDetector.detectChanges();
        } catch (e) {
            console.log('Failed to load TTS data', e);
            if (attempt < 5) {
                setTimeout(() => this.loadTtsData(attempt + 1), 400);
                return;
            }
            this.status = 'Failed to load languages/voices';
            this.aioChangeDetector.detectChanges();
        }
    }
    onLanguageChange(): any {
        this.filteredVoices = this.voices.filter((voice) => {
            const language = (voice.language || '').toLowerCase();
            const selected = (this.selectedLanguage || '').toLowerCase();
            return language === selected || language.indexOf(selected.split('-')[0]) === 0;
        });
        if (!this.filteredVoices.some((voice) => voice.identifier === this.selectedVoice)) {
            this.selectedVoice = this.filteredVoices.length? this.filteredVoices[0].identifier: '';
        }
    }
    async stop(): Promise < any > {
        await this.apperyTTS.stop();
        this.status = 'Stopped';
    }
    constructor(public Apperyio: ApperyioHelperService, private $aio_mappingHelper: ApperyioMappingHelperService, private $aio_changeDetector: ChangeDetectorRef, public apperyTTS: ApperyTTS) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
        this.text = 'Hello world';
        this.selectedLanguage = 'en-US';
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