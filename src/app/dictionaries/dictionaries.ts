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
    templateUrl: 'dictionaries.html',
    selector: 'page-dictionaries',
    styleUrls: ['dictionaries.css', 'dictionaries.scss']
})
export class dictionaries {
    public aioScreenName = "dictionaries";
    public keyword: string;
    public collectionName: string;
    public modalName: string;
    public copyItems: any;
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
    async ngOnInit(): Promise < any > {
        try {
            await this.$v.loadDictionaries();
            this.$v.libraryDictionaries = await this.$a.db.query("dictionaries", {
                where: {
                    userId: 'library'
                }
            });
        } catch (e) {
            await this.$a.showError(e);
        }
        this.Apperyio.setThinScrollIfNeeded();
    }
    async ionViewWillEnter(): Promise < any > {
        try {
            await this.$v?.ionViewWillEnter?.call?.(this);
        } catch (e) {
            console.log(e);
        }
        document.documentElement.classList.toggle("aio-no-bounce", false);
        try {
            console.log('ionViewWillEnter dictionaries');
            //await this.refresh();
            //await this.$v.loadDictionaries();
            window.dispatchEvent(new Event('resize'));
        } catch (e) {
            await this.$a.showError(e);
        }
        window.currentScreen = this;
    }
    async deleteItem(item, list?): Promise < any > {
        try {
            if (!await this.$a.alertOkCancelAsync("Are you sure?", "Item will be deleted")) return list?.closeSlidingItems();
            await this.$a.db.remove(this.collectionName, item, {
                loading: true,
                message: 'Item was removed'
            });
            this.$a.removeFromArray(this.$v.dictionaries, item);
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    async selectItem(item): Promise < any > {
        try {
            // let data = await this.$a.modal(this.modalName, {
            //     collectionName: this.collectionName,
            //     item: _.cloneDeep(item)
            // });
            // if (data) this.$a.replaceObject(item, data);
            //this.$a.navigateTo("dictionarydetails", item._id);
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    async addItem(): Promise < any > {
        try {
            // let data = await this.$a.modal(this.modalName, {
            //     collectionName: this.collectionName
            // });
            // if (data) this.items = [...this.items, data];
            this.$a.navigateTo("dictionarydetails", 'new');
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    async refresh(event?): Promise < any > {
        try {
            this.$v.dictionaries = await this.$a.db.query('dictionaries', {
                where: {
                    userId: this.$v.user._id
                }
            });
            await this.checkWords();
            await this.$a.setStorage('dictionaries', this.$v.dictionaries);
            event?.target?.complete();
            this.copyItems = this.$a._.cloneDeep(this.$v.dictionaries);
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    filter(): any {
        if (!this.keyword) return this.$v.dictionaries = this.copyItems;
        this.$v.dictionaries = this.copyItems?.filter(item => this.$a.hasString(item.name, this.keyword));
    }
    async play(item, event): Promise < any > {
        console.log('play', item, event);
        event.preventDefault?.();
        event.stopPropagation?.();
        this.$v.dictionary = item;
        if (!await this.apperySpeech.ensureReady()) return;
        this.$a.navigateTo('play', item._id);
    }
    async checkWords(): Promise < any > {
        let dictionaryName = 'mydictionary'; // + this.dictionary.from + '-' + this.dictionary.to;
        this.mydictionary = await this.$a.getStorage(dictionaryName) || {};
        for (let item of this.$v.dictionaries) {
            let count = 0;
            item.knownWords = 0;
            for (let word of item.words) {
                if (this.mydictionary[word[0]] >= 3) item.knownWords++;
            }
        }
    }
    async addLibrary(dictionary, event): Promise < any > {
        try {
            await this.$a.showLoading();
            console.log('add', dictionary, event);
            event.preventDefault?.();
            event.stopPropagation?.();
            let addDictionary = this.$a._.cloneDeep(dictionary);
            addDictionary.libId = dictionary._id;
            delete addDictionary._id;
            delete addDictionary.acl;
            delete addDictionary._createdAt;
            delete addDictionary._updatedAt;
            let data = await this.$a.db.save("dictionaries", {
                ...addDictionary,
                ...{
                    userId: this.$v.user._id
                }
            }, {
                message: 'Item was added'
            });
            dictionary.hide = true;
        } catch (e) {
            await this.$a.showError(e);
        }
        await this.$a.dismissLoading();
    }
    async changeLibrary(): Promise < any > {
        if (this.$v.library) {
            for (let dictionary of this.$v.libraryDictionaries) {
                let dic = this.$a._.find(this.$v.dictionaries, {
                    libId: dictionary._id
                });
                dictionary.hide = !!dic;
            }
        } else {
            await this.$v.loadDictionaries();
        }
    }
    openLib(item): any {
        this.$a.navigateTo("dictionarydetails", item._id);
    }
    constructor(public Apperyio: ApperyioHelperService, private $aio_mappingHelper: ApperyioMappingHelperService, private $aio_changeDetector: ChangeDetectorRef, public apperySpeech: ApperySpeech) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
        this.keyword = '';
        this.collectionName = 'dictionaries';
        this.modalName = 'note';
        this.mydictionary = {};
        this.aioChangeDetector = this.$aio_changeDetector;
    }
    ionViewWillLeave() {
        try {
            this.$v?.ionViewWillLeave?.call?.(this);
        } catch (e) {
            console.log(e);
        }
    }
}