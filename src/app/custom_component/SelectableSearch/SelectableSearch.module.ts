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
    RouterModule
} from '@angular/router';
import {
    IonicModule
} from '@ionic/angular';
import {
    ApperyioTranslateModule
} from '../../scripts/apperyio/translate_module';
import {
    ApperyioDeclarablesModule
} from '../../scripts/apperyio/declarables/apperyio.declarables.module';
import {
    SelectableSearch
} from './SelectableSearch';
import {
    PipesModule
} from '../../scripts/pipes.module';
import {
    DirectivesModule
} from '../../scripts/directives.module';
import {
    ComponentsModule
} from '../../scripts/components.module';
import {
    CustomModulesModule
} from '../../scripts/custom-modules.module';
import {
    IonicSelectableAddItemTemplateDirective,
    IonicSelectableCloseButtonTemplateDirective,
    IonicSelectableComponent,
    IonicSelectableFooterTemplateDirective,
    IonicSelectableGroupEndTemplateDirective,
    IonicSelectableGroupTemplateDirective,
    IonicSelectableHeaderTemplateDirective,
    IonicSelectableIconTemplateDirective,
    IonicSelectableItemEndTemplateDirective,
    IonicSelectableItemIconTemplateDirective,
    IonicSelectableItemTemplateDirective,
    IonicSelectableMessageTemplateDirective,
    IonicSelectableModalComponent,
    IonicSelectablePlaceholderTemplateDirective,
    IonicSelectableSearchFailTemplateDirective,
    IonicSelectableTitleTemplateDirective,
    IonicSelectableValueTemplateDirective
} from 'ionic-selectable';
@NgModule({
    declarations: [
        SelectableSearch
    ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        PipesModule,
        DirectivesModule,
        ComponentsModule,
        ApperyioDeclarablesModule,
        CustomModulesModule, IonicSelectableAddItemTemplateDirective, IonicSelectableCloseButtonTemplateDirective, IonicSelectableComponent, IonicSelectableFooterTemplateDirective, IonicSelectableGroupEndTemplateDirective, IonicSelectableGroupTemplateDirective, IonicSelectableHeaderTemplateDirective, IonicSelectableIconTemplateDirective, IonicSelectableItemEndTemplateDirective, IonicSelectableItemIconTemplateDirective, IonicSelectableItemTemplateDirective, IonicSelectableMessageTemplateDirective, IonicSelectableModalComponent, IonicSelectablePlaceholderTemplateDirective, IonicSelectableSearchFailTemplateDirective, IonicSelectableTitleTemplateDirective, IonicSelectableValueTemplateDirective, RouterModule,
        ApperyioTranslateModule
    ],
    exports: [
        SelectableSearch
    ]
})
export class SelectableSearchComponentModule {}