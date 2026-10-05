import {
    NgModule
} from '@angular/core';
import {
    SelectableSearchComponentModule
} from '../custom_component/SelectableSearch/SelectableSearch.module';
import {
    AioCustomLoadingComponentModule
} from '../custom_component/AioCustomLoading/AioCustomLoading.module';
@NgModule({
    declarations: [],
    exports: [
        SelectableSearchComponentModule,
        AioCustomLoadingComponentModule,
    ],
    imports: []
})
export class CustomComponentsModule {}