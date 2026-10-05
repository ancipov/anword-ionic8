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
    templateUrl: 'profile.html',
    selector: 'page-profile',
    styleUrls: ['profile.css', 'profile.scss']
})
export class profile {
    public aioScreenName = "profile";
    public viewMode: boolean;
    public photoFile: any;
    public photoSrc: string;
    public profile: any;
    public username: any;
    public password: any;
    public $a: ApperyioHelperService;
    public $v: {
        [name: string]: any
    };
    public aioChangeDetector: ChangeDetectorRef;
    public currentItem: any = null;
    private _aioPrevNoBounce = false;
    @ViewChild('_aio_content') _aio_content;
    public mappingData: any = {
        "j_300__visible": false,
    };
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
    @ViewChild('form', {
        static: true
    }) public form;
    ngOnInit(): any {
        try {
            this.updateData();
        } catch (e) {
            this.$a.showError(e);
        }
        this.Apperyio.setThinScrollIfNeeded();
    }
    async changePhoto(): Promise < any > {
        try {
            let base64String;
            if (this.$a.isMobile() && this.$a.isAndroid()) {
                const actionSheet = await this.$a.getController("ActionSheetController").create({
                    header: this.$a.translate.instant('Select Source'),
                    buttons: [{
                            text: this.$a.translate.instant('Camera'),
                            data: 'camera',
                            icon: 'camera-outline'
                        },
                        {
                            text: this.$a.translate.instant('Gallery'),
                            data: 'gallery',
                            icon: 'images-outline'
                        },
                        {
                            text: this.$a.translate.instant('Cancel'),
                            role: 'cancel',
                            icon: 'close-outline'
                        },
                    ],
                });
                await actionSheet.present();
                const result = await actionSheet.onDidDismiss();
                if (!result?.data) return;
                try {
                    base64String = await this.$a.native.camera.getPicture({
                        correctOrientation: true,
                        quality: 75,
                        sourceType: result.data == 'camera'?
                        1: 0,
                        destinationType: 0
                    });
                } catch (e) {
                    console.log(e);
                }
            } else {
                base64String = await this.$a.readFile(this.photoFile);
            }
            if (!base64String) return;
            base64String = await this.$a.resizeImage(base64String, {
                width: 800,
                height: 600
            });
            const result = await this.$a.modal("cropimage", {
                img: base64String,
                roundCropper: true,
                maintainAspectRatio: true
            });
            if (result) this.photoSrc = result;
        } catch (e) {
            await this.$a.showError(e);
        }
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
            let user: any = {
                username: this.username
            };
            if (this.password) user.password = this.password;
            let fileData;
            if (this.$a.isDataURL(this.photoSrc)) {
                let file = await this.$a.db.uploadBase64File(this.photoSrc, this.$v.user._id + ".jpg");
                this.profile.avatar = file.fileName;
            }
            let data = await this.$a.sc('updateUserScriptId', {
                user,
                profile: this.profile
            }, {
                showrError: false,
                throwError: true
            });
            this.$v.user = data.user;
            this.$v.profile = data.profile;
            this.profile = _.cloneDeep(this.$v.profile);
            this.viewMode = true;
            this.$v.saveState();
            let savedUser = await this.$a.ssGet('savedUser_' + this.$a.projectInfo?.guid);
            savedUser.username = this.username;
            if (this.password) savedUser.password = this.password;
            await this.$a.ssSet('savedUser_' + this.$a.projectInfo?.guid, savedUser);
            this.$a.toast("User profile was updated");
        } catch (e) {
            await this.$a.showError(e);
        }
        await this.$a.dismissLoading();
    }
    updateData(): any {
        try {
            this.photoSrc = this.$v.profile?.avatar?.fileurl || './assets/images/avatar.png';
            this.profile = _.cloneDeep(this.$v.profile);
            this.username = this.$v.user?.status && this.$v.user.status != "anonymous"?
            this.$v.user.username: '';
        } catch (e) {
            this.$a.showError(e);
        }
    }
    cancel(): any {
        try {
            this.updateData();
            this.viewMode = true;
        } catch (e) {
            this.$a.showError(e);
        }
    }
    edit(): any {
        try {
            this.viewMode = false;
        } catch (e) {
            this.$a.showError(e);
        }
    }
    constructor(public Apperyio: ApperyioHelperService, private $aio_mappingHelper: ApperyioMappingHelperService, private $aio_changeDetector: ChangeDetectorRef) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
        this.viewMode = true;
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
    ionViewDidEnter() {
        this.pageIonViewDidEnter__j_256();
    }
    ionViewWillLeave() {
        try {
            this.$v?.ionViewWillLeave?.call?.(this);
        } catch (e) {
            console.log(e);
        }
    }
    async pageIonViewDidEnter__j_256(event?, currentItem?) {
        let mappingData: any = {};
        let __aio_tmp_val__: any;
        this.mappingData = { ...this.mappingData,
            ...mappingData
        };
    }
    async savebuttonClick__j_295(event?, currentItem?) {
        let __aio_tmp_val__: any;
    }
    async cancelbuttonClick__j_302(event?, currentItem?) {
        let __aio_tmp_val__: any;
    }
    async editbuttonClick__j_304(event?, currentItem?) {
        let __aio_tmp_val__: any;
    }
}