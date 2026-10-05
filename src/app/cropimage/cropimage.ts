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
    ImageCropperComponent
} from 'ngx-image-cropper';
import {
    $aio_empty_object
} from '../scripts/interfaces';
@Component({
    standalone: false,
    templateUrl: 'cropimage.html',
    selector: 'page-cropimage',
    styleUrls: ['cropimage.css', 'cropimage.scss']
})
export class cropimage {
    public aioScreenName = "cropimage";
    public img: string;
    @ViewChild(ImageCropperComponent, {
        static: false
    }) public imageCropper: ImageCropperComponent;
    public angle: any;
    public roundCropper: any;
    public maintainAspectRatio: any;
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
    crop(): any {
        try {
            this.$a.closeModal(this.imageCropper.crop().base64);
        } catch (e) {
            this.$a.showError(e);
        }
    }
    rotate(isClockwise): any {
        if (isClockwise) this.angle++;
        else this.angle--;
        for (let time of [100, 200, 500, 1000, 1500]) setTimeout(() => this.aioChangeDetector.detectChanges(), time);
    }
    constructor(public Apperyio: ApperyioHelperService, private $aio_mappingHelper: ApperyioMappingHelperService, private $aio_changeDetector: ChangeDetectorRef) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
        this.angle = 0;
        this.aioChangeDetector = this.$aio_changeDetector;
    }
    ngOnInit() {
        this.Apperyio.setThinScrollIfNeeded();
    }
    ionViewWillEnter() {
        this._aioPrevNoBounce = document.documentElement.classList.contains("aio-no-bounce");
        window.parentCurrentScreen = window.currentScreen;
        document.documentElement.classList.toggle("aio-no-bounce", false);
        window.currentScreen = this;
        try {
            this.$v?.ionViewWillEnter?.call?.(this);
        } catch (e) {
            console.log(e);
        }
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