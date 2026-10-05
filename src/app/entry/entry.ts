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
    ViewChild
} from '@angular/core';
import {
    $aio_empty_object
} from '../scripts/interfaces';
@Component({
    standalone: false,
    templateUrl: 'entry.html',
    selector: 'page-entry',
    styleUrls: ['entry.css', 'entry.scss']
})
export class entry {
    public aioScreenName = "entry";
    public item: any;
    public originalItem: any;
    public collectionName: string;
    public file: any;
    public removedImages: any;
    @ViewChild('swiper', {
        static: false
    }) public swiper: any;
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
        this._aioPrevNoBounce = document.documentElement.classList.contains("aio-no-bounce");
        document.documentElement.classList.toggle("aio-no-bounce", false);
        try {
            this.originalItem = _.cloneDeep(this.item);
            this.removedImages = [];
        } catch (e) {
            await this.$a.showError(e);
        }
        window.parentCurrentScreen = window.currentScreen;
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
            let index = 1;
            for (let image of this.item.images) {
                if (!image.fileurl.startsWith("https")) {
                    let file = await this.$a.db.uploadBase64File(image.fileurl, "img-" + Date.now() + "-" + index++ + ".jpg");
                    this.$a.replaceObject(image, file);
                }
            }
            let data = await this.$a.db.save(this.collectionName, {
                ...this.item,
                userId: this.$v.user._id
            }, {
                loading: true,
                message: 'Item was saved'
            });
            for (let image of this.removedImages) {
                await this.$a.db.deleteFile(image.fileName);
            }
            this.$a.closeModal(data);
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    async close(): Promise < any > {
        try {
            if (_.isEqual(this.originalItem, this.item) || await this.$a.alertOkCancelAsync("Are you sure?", "Unsaved data will be lost")) this.$a.closeModal();
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    async selectFile(): Promise < any > {
        try {
            let base64String = await this.$a.readFile(this.file);
            await this.processImage(base64String);
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    async scanDocument(): Promise < any > {
        try {
            let base64String = await this.$a.native.docScanner.scan({
                useBase64: true,
                captureMode: 2
            });
            if (!base64String) return;
            await this.processImage(base64String);
        } catch (e) {
            console.log(e);
        }
    }
    async camera(): Promise < any > {
        try {
            let base64String = this.$a.isMobile()? await this.$a.native.camera.getPicture({
                quality: 75,
                destinationType: 0
            }): await this.$a.modal('camera');
            if (!base64String) return;
            await this.processImage(base64String);
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    async processImage(base64String): Promise < any > {
        base64String = await this.$a.resizeImage(base64String, {
            width: 1920,
            height: 1080
        });
        let data = await this.$a.modal('cropimage', {
            img: base64String
        });
        if (data) base64String = data;
        this.item.images.push({
            fileurl: base64String
        });
        await this.$a.timeout(500);
        this.swiper?.nativeElement.swiper.slideTo(this.item.images.length - 1);
        this.swiper?.nativeElement.swiper.update()
    }
    removeImage(image): any {
        this.$a.removeFromArray(this.item.images, image);
        this.swiper?.nativeElement.swiper.update();
        if (this.item.images.length) this.swiper?.nativeElement.swiper.slideTo(0);
        if (image.fileurl.startsWith("https")) this.removedImages.push(image);
        this.$a.toast("Image was removed");
    }
    constructor(public Apperyio: ApperyioHelperService, private $aio_mappingHelper: ApperyioMappingHelperService, private $aio_changeDetector: ChangeDetectorRef) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
        this.item = {
            images: [],
            date: new Date().toISOString()
        };
        this.removedImages = [];
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