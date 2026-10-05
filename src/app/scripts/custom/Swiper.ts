import {
    NgModule
} from '@angular/core';
import {
    CommonModule
} from '@angular/common';

import {
    register
} from 'swiper/element/bundle';

register();

/**
 *
 * See https://angular.io/guide/sharing-ngmodules, https://angular.io/api/core/NgModule for more info on Angular Modules.
 */
@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [],
    exports: []
})

class SwiperModule {}

export {
    SwiperModule as ExportedClass
};