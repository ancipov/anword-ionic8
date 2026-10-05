import {
    NgModule
} from '@angular/core';
import {
    ExportedClass as MarkdownModule
} from './custom/MarkdownModule';
import {
    ExportedClass as JsonModule
} from './custom/JsonModule';
import {
    ExportedClass as Swiper
} from './custom/Swiper';
import {
    ExportedClass as CoreModule
} from './custom/CoreModule';
@NgModule({
    declarations: [],
    imports: [],
    exports: [
        MarkdownModule,
        JsonModule,
        Swiper,
        CoreModule,
    ]
})
export class CustomModulesModule {}