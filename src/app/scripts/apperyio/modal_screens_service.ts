import {
    Injectable
} from '@angular/core';
@Injectable()
export class ModalScreensService {
    private modalScreens: {
        [name: string]: any
    } = {};
    async getModalScreen(screenName: string) {
        if (!this.modalScreens[screenName]) {
            let modalImport;
            switch (screenName) {
                case "entry":
                    modalImport = await
                    import (`../../entry/entry`);
                    break;
                case "camera":
                    modalImport = await
                    import (`../../camera/camera`);
                    break;
                case "changepassword":
                    modalImport = await
                    import (`../../changepassword/changepassword`);
                    break;
                case "cropimage":
                    modalImport = await
                    import (`../../cropimage/cropimage`);
                    break;
                case "speechrecognitionmodal":
                    modalImport = await
                    import (`../../speechrecognitionmodal/speechrecognitionmodal`);
                    break;
            }
            if (modalImport) {
                this.modalScreens[screenName] = modalImport[screenName];
            }
        }
        return this.modalScreens[screenName]
    }
};