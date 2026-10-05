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
    $aio_empty_object
} from '../scripts/interfaces';
import {
    ViewChild
} from '@angular/core';
@Component({
    standalone: false,
    templateUrl: 'deepseek.html',
    selector: 'page-deepseek',
    styleUrls: ['deepseek.css', 'deepseek.scss']
})
export class deepseek {
    public aioScreenName = "deepseek";
    public text: string;
    public isWait: any;
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
    async sendMessage(): Promise < any > {
        try {
            if (!this.$v.deepSeekApiKey) return this.$a.alert(`You need to provide an DeepSeek API key on "Model and Storage" - "Storage" tab, to use DeepSeek.`, "Warning");
            if (this.isWait) return this.$a.toast("Please wait while DeepSeek responds to the current question.");
            this.$v.chatMessages.push({
                role: "user",
                content: this.text,
                time: new Date().toLocaleTimeString()
            });
            this.text = '';
            this.isWait = true;
            this.$a.scrollBottom(this);
            let message = await this.$v.deepSeekRequest(this.$v.chatMessages);
            this.$v.chatMessages.push({
                role: "assistant",
                content: message,
                time: new Date().toLocaleTimeString()
            });
            this.$a.scrollBottom(this);
            this.isWait = false;
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    constructor(public Apperyio: ApperyioHelperService, private $aio_mappingHelper: ApperyioMappingHelperService, private $aio_changeDetector: ChangeDetectorRef) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
        this.isWait = false;
        this.aioChangeDetector = this.$aio_changeDetector;
    }
    ngOnInit() {
        this.Apperyio.setThinScrollIfNeeded();
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