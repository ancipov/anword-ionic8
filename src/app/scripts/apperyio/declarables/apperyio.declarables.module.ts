import {
    NgModule
} from '@angular/core';
import {
    CommonModule
} from '@angular/common';
import {
    FormsModule
} from '@angular/forms';
import {
    IonicModule
} from '@ionic/angular';
import {
    ApperyioTranslateModule
} from '../translate_module';
import ApperyioControlValidationDirective from './apperyio_control_validation_directive';
import ApperyioCustomMarkAsTouchDirective from './apperyio_custom_markastouch_directive';
import ApperyioMarkAsTouchDirective from './apperyio_markastouch_directive';
import ApperyioFormChangeDirective from './apperyio_form_change_directive';
import ApperyioPasswordShowDirective from './apperyio_password_show_directive';
import ApperyioDatatableResizerDirective from './apperyio_datatable_resizer_directive';
import ApperyioTesterButtons from './apperyio_tester_buttons_component';
import ApperyioFilePicker from './apperyio_file_picker_component';
import ApperyioDatetime from './apperyio_datetime_component';
import PromptModalComponent from './apperyio_pwa_prompt_component';
import {
    IonSlidesComponent,
    IonSlideComponent
} from './appery_ion_slides_component';
import AioAnimatedTabsDirective from './apperyio_animated_tabs_directive';
import ClockRevealDirective from './apperyio_clock_reveal_directive';
import AioScreenSlidingDirective from './apperyio_screen_sliding_directive';
import {
    PatchIonChangeDirective,
    IonChangeAsIonInputDirective
} from './apperyio_patch_for_legacy_behaviour';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ApperyioTranslateModule,
        IonSlidesComponent,
        IonSlideComponent,
    ],
    declarations: [
        ApperyioControlValidationDirective,
        ApperyioCustomMarkAsTouchDirective,
        ApperyioMarkAsTouchDirective,
        ApperyioFormChangeDirective,
        ApperyioPasswordShowDirective,
        ApperyioDatatableResizerDirective,
        ApperyioTesterButtons,
        ApperyioFilePicker,
        ApperyioDatetime,
        PromptModalComponent,
        AioAnimatedTabsDirective,
        ClockRevealDirective,
        AioScreenSlidingDirective,
        PatchIonChangeDirective,
        IonChangeAsIonInputDirective,
    ],
    exports: [
        ApperyioControlValidationDirective,
        ApperyioCustomMarkAsTouchDirective,
        ApperyioMarkAsTouchDirective,
        ApperyioFormChangeDirective,
        ApperyioPasswordShowDirective,
        ApperyioDatatableResizerDirective,
        ApperyioTesterButtons,
        ApperyioFilePicker,
        ApperyioDatetime,
        PromptModalComponent,
        IonSlidesComponent,
        IonSlideComponent,
        AioAnimatedTabsDirective,
        ClockRevealDirective,
        AioScreenSlidingDirective,
        PatchIonChangeDirective,
        IonChangeAsIonInputDirective,
    ]
})
export class ApperyioDeclarablesModule {}