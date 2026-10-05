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
    templateUrl: 'camera.html',
    selector: 'page-camera',
    styleUrls: ['camera.css', 'camera.scss']
})
export class camera {
    public aioScreenName = "camera";
    public webcam: any;
    public cameras: any;
    public selectedCamera: any;
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
        try {
            const webcamElement = document.getElementById('webcam');
            const canvasElement = document.getElementById('canvas');
            const snapSoundElement = document.getElementById('snapSound');
            this.webcam = new window.Webcam(webcamElement, 'environment', canvasElement, snapSoundElement);
            await this.webcam.start();
            this.cameras = this.webcam.webcamList;
            this.selectedCamera = this.cameras?.[0]?.deviceId;
            for (let camera of this.cameras) {
                if (this.$a.hasString(camera?.label, 'back')) {
                    this.selectedCamera = camera.deviceId;
                    break;
                }
            }
            await this.webcam.start();
        } catch (e) {
            await this.$a.showError(e);
        }
        window.parentCurrentScreen = window.currentScreen;
        window.currentScreen = this;
    }
    ionViewWillLeave(): any {
        try {
            this.$v?.ionViewWillLeave?.call?.(this);
        } catch (e) {
            console.log(e);
        }
        try {
            this.webcam.stop();
        } catch (e) {
            this.$a.showError(e);
        }
        document.documentElement.classList.toggle("aio-no-bounce", this._aioPrevNoBounce);
    }
    takePhoto(): any {
        try {
            this.$a.closeModal(this.webcam.snap());
        } catch (e) {
            this.$a.showError(e);
        }
    }
    changeCamera(): any {
        try {
            this.webcam.selectedDeviceId = this.selectedCamera;
            this.webcam.start();
        } catch (e) {
            this.$a.showError(e);
        }
    }
    constructor(public Apperyio: ApperyioHelperService, private $aio_mappingHelper: ApperyioMappingHelperService, private $aio_changeDetector: ChangeDetectorRef) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
        this.cameras = [];
        this.aioChangeDetector = this.$aio_changeDetector;
    }
    ngOnInit() {
        this.Apperyio.setThinScrollIfNeeded();
    }
    ionViewDidLeave() {
        window.currentScreen = window.parentCurrentScreen;
        delete window.parentCurrentScreen;
    }
}