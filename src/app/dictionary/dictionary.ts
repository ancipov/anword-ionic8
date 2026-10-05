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
    NavController
} from '@ionic/angular';
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
    templateUrl: 'dictionary.html',
    selector: 'page-dictionary',
    styleUrls: ['dictionary.css', 'dictionary.scss']
})
export class dictionary {
    public aioScreenName = "dictionary";
    public item: any;
    public originalItem: any;
    public collectionName: string;
    public words: any;
    public languages: any;
    public request: any;
    public label: any;
    public keyword: any;
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
    @ViewChild('itemForm', {
        static: true
    }) public itemForm;
    async ionViewWillEnter(): Promise < any > {
        try {
            await this.$v?.ionViewWillEnter?.call?.(this);
        } catch (e) {
            console.log(e);
        }
        document.documentElement.classList.toggle("aio-no-bounce", false);
        try {
            let id = this.$a.getRouteParam("id");
            this.languages = []
            let langs = await this.apperySpeech.getSupportedLanguages();
            for (let lang of langs) {
                this.languages.push({
                    name: this.apperySpeech.getLanguageLabel(lang),
                    value: lang
                })
            }
            this.item = id == 'new'? {
                from: (navigator.languages && navigator.languages.length)? navigator.languages[0]: ( < any > navigator).userLanguage || navigator.language || ( < any > navigator).browserLanguage || 'en-US',
                to: 'en-US',
                words: []
            }: await this.$a.db.getById(this.collectionName, id);
            //this.words = JSON.stringify(this.item.words);
            this.originalItem = _.cloneDeep(this.item);
        } catch (e) {
            await this.$a.showError(e);
        }
        window.currentScreen = this;
    }
    async save(): Promise < any > {
        try {
            if (true) {
                let formId = this._aio_content?.el?.querySelector?.("form[viewchild_name]")?.getAttribute('viewchild_name');
                if (formId && this[formId]) {
                    if (this.$a.markFormAsTouched(this[formId])) return;
                }
            }
            await this.$a.showLoading();
            //this.item.words = JSON.parse(this.words);
            let addDictionary = this.$a._.cloneDeep(this.item);
            if (this.item.userId == 'library') {
                addDictionary.libId = this.item._id;
                let dic = this.$a._.find(this.$v.libraryDictionaries, {
                    _id: this.item._id
                })
                dic.hide = true;
                this.$v.library = false;
                delete addDictionary._id;
                delete addDictionary.acl;
                delete addDictionary._createdAt;
                delete addDictionary._updatedAt;
            }
            let data = await this.$a.db.save(this.collectionName, {
                ...addDictionary,
                userId: this.$v.user._id
            }, {
                message: 'Item was saved'
            });
            await this.$v.loadDictionaries();
            //this.$a.navigateTo("dictionaries");
            this.navCtrl.back();
            //this.$a.closeModal(data);
        } catch (e) {
            await this.$a.showError(e);
        }
        await this.$a.dismissLoading();
    }
    async close(): Promise < any > {
        try {
            if (_.isEqual(this.originalItem, this.item) || await this.$a.alertOkCancelAsync("Are you sure?", "Unsaved data will be lost")) this.$a.closeModal();
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    async generate(): Promise < any > {
        try {
            // try {
            //     await this.$a.showLoading();
            this.words = await this.$a.sc("anwordDeepSeekServiceId", {
                message: this.request,
                from: this.item.from,
                to: this.item.to
            }, {
                loading: true,
                showError: true
            });
            this.words = JSON.stringify(this.words);
            //     await this.$v.deepSeekRequest(`user request is ${this.request} it is needed to generate response in fromat [["привет", "hello"], ["дом", "home"]] if user doesn't specify languages use from language ${this.item.from} and to language ${this.item.to}`);
            //     await this.$a.dismissLoading();
            // } catch (e) {
            //     console.log(e);
            //     await this.$a.dismissLoading();
            // }
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    async add(): Promise < any > {
        const alert = await this.$a.getController("AlertController").create({
            header: 'Add Pair',
            inputs: [{
                name: 'from',
                type: 'text',
                placeholder: 'from'
            }, {
                name: 'to',
                type: 'text',
                placeholder: 'to'
            }],
            buttons: [{
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'OK',
                    handler: (data) => {
                        if (data?.from && data?.to) this.item.words.push([data.from, data.to])
                    }
                }
            ]
        });
        await alert.present();
    }
    async deleteWord(word, event, list?): Promise < any > {
        event.stopPropagation();
        event.preventDefault();
        if (!await this.$a.alertOkCancelAsync("Are you sure?", "Item will be deleted")) return list?.closeSlidingItems();
        this.$a.removeFromArray(this.item.words, word);
    }
    async select(word): Promise < any > {
        const alert = await this.$a.getController("AlertController").create({
            header: 'Update Pair',
            inputs: [{
                name: 'from',
                type: 'text',
                value: word[0],
                placeholder: 'from'
            }, {
                name: 'to',
                type: 'text',
                value: word[1],
                placeholder: 'to'
            }],
            buttons: [{
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'OK',
                    handler: (data) => {
                        if (data?.from && data?.to) {
                            word[0] = data.from;
                            word[1] = data.to;
                        }
                    }
                }
            ]
        });
        await alert.present();
    }
    async importWords(): Promise < any > {
        const alert = await this.$a.getController("AlertController").create({
            header: 'Input words ',
            subHeader: 'Format: [["from", "to"], ["from", "to"]]',
            inputs: [{
                name: 'jsonInput',
                type: 'textarea',
                placeholder: '[["from", "to"], ["from", "to"]]',
                attributes: {
                    rows: 6
                }
            }],
            buttons: [{
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Ok',
                    handler: (data) => {
                        const errorEl = document.getElementById('alert-error-msg');
                        try {
                            // 1. Проверяем, является ли строка валидным JSON
                            const parsed = JSON.parse(data.jsonInput);
                            // 2. Проверяем структуру: это должен быть массив
                            if (!Array.isArray(parsed)) throw new Error();
                            // 3. Проверяем каждый элемент: это должен быть массив строго из 2 строк
                            const isValidStructure = parsed.every(item =>
                                Array.isArray(item) &&
                                item.length === 2 &&
                                typeof item[0] === 'string' &&
                                typeof item[1] === 'string'
                            );
                            if (!isValidStructure) throw new Error();
                            // Если всё успешно: скрываем ошибку, логируем данные и закрываем алерт
                            if (errorEl) errorEl.style.display = 'none';
                            console.log('Валидный массив маршрутов:', parsed);
                            this.item.words = [...this.item.words, ...parsed];
                            return true;
                        } catch (e) {
                            console.log(e);
                            this.$a.alert('Wrong Format');
                            // Если произошла ошибка парсинга или структуры: показываем текст ошибки
                            if (errorEl) errorEl.style.display = 'block';
                            return false; // Возвращаем false, чтобы алерт НЕ закрывался
                        }
                    }
                }
            ]
        });
        await alert.present();
        // const alert = await this.$a.getController("AlertController").create({
        //     header: 'Words in format [["from", "to"], ["from", "to"]]',
        //     inputs: [{
        //         name: 'words',
        //         placeholder: 'words',
        //         type: 'textarea', // Tells Ionic to render a textarea
        //         attributes: {
        //           rows: 4, // Controls the initial visual height
        //           maxlength: 50000 // Optional character limit
        //         }
        //     }],
        //     buttons: [{
        //             text: 'Cancel',
        //             role: 'cancel'
        //         },
        //         {
        //             text: 'OK',
        //             handler: (data) => {
        //                 if (data?.words) this.item.words = data.words;
        //             }
        //         }
        //     ]
        // });
        await alert.present();
    }
    async ai(): Promise < any > {
        const alert = await this.$a.getController("AlertController").create({
            header: 'Generate words ',
            //    subHeader: 'Format: [["from", "to"], ["from", "to"]]',
            inputs: [{
                name: 'jsonInput',
                type: 'textarea',
                placeholder: '100 most common words',
                attributes: {
                    rows: 6
                }
            }],
            buttons: [{
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Ok',
                    handler: async (data) => {
                        try {
                            let words = await this.$a.sc("anwordDeepSeekServiceId", {
                                message: data.jsonInput,
                                from: this.item.from,
                                to: this.item.to
                            }, {
                                loading: true,
                                showError: true
                            });
                            words = JSON.stringify(words);
                            this.item.words = [...this.item.words, ...words];
                        } catch (e) {
                            console.log(e);
                            this.$a.alert('Wrong Request');
                        }
                    }
                }
            ]
        });
        await alert.present();
        await alert.present();
    }
    constructor(public Apperyio: ApperyioHelperService, private $aio_mappingHelper: ApperyioMappingHelperService, private $aio_changeDetector: ChangeDetectorRef, public navCtrl: NavController, public apperySpeech: ApperySpeech) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
        this.item = {};
        this.collectionName = 'dictionaries';
        this.languages = [];
        this.label = 'Words in format [["from", "to"], ["from", "to"]]';
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