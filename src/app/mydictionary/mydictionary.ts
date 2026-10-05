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
    templateUrl: 'mydictionary.html',
    selector: 'page-mydictionary',
    styleUrls: ['mydictionary.css', 'mydictionary.scss']
})
export class mydictionary {
    public aioScreenName = "mydictionary";
    public mydictionary: any;
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
        let dictionaryName = 'mydictionary'; // + this.dictionary.from + '-' + this.dictionary.to;
        this.mydictionary = await this.$a.getStorage(dictionaryName);
        window.currentScreen = this;
    }
    async deleteAll(): Promise < any > {
        if (!await this.$a.alertOkCancelAsync("Your dictionary will be reset", "Are you sure?")) return;
        let dictionaryName = 'mydictionary'; // + this.dictionary.from + '-' + this.dictionary.to;
        this.$v.mydictionary.words = {};
        await this.$a.setStorage(dictionaryName, this.$v.mydictionary);
        await this.$a.db.save('mydictionary', {
            _id: this.$v.mydictionary._id,
            userId: this.$v.user._id,
            name: dictionaryName,
            words: JSON.stringify(this.$v.mydictionary.words)
        });
        for (let item of this.$v.dictionaries) {
            item.knownWords = 0;
        }
    }
    async deleteItem(item, event): Promise < any > {
        event.stopPropagation();
        event.preventDefault();
        if (!await this.$a.alertOkCancelAsync("Are you sure?", "Item will be deleted")) return;
        this.$a.removeFromArray(this.$v.mydictionary.words, item);
        let dictionaryName = 'mydictionary'; // + this.dictionary.from + '-' + this.dictionary.to;
        await this.$a.setStorage(dictionaryName, this.$v.mydictionary);
        await this.$a.db.save('mydictionary', {
            _id: this.$v.mydictionary._id,
            userId: this.$v.user._id,
            name: dictionaryName,
            words: JSON.stringify(this.$v.mydictionary.words)
        });
    }
    constructor(public Apperyio: ApperyioHelperService, private $aio_mappingHelper: ApperyioMappingHelperService, private $aio_changeDetector: ChangeDetectorRef) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
        this.mydictionary = {};
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