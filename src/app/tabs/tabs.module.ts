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
    Routes
} from '@angular/router';
import {
    IonicModule
} from '@ionic/angular';
import {
    ApperyioTranslateModule
} from '../scripts/apperyio/translate_module';
import {
    ApperyioDeclarablesModule
} from '../scripts/apperyio/declarables/apperyio.declarables.module';
import {
    tabs
} from './tabs';
import {
    PipesModule
} from '../scripts/pipes.module';
import {
    DirectivesModule
} from '../scripts/directives.module';
import {
    ComponentsModule
} from '../scripts/components.module';
import {
    CustomComponentsModule
} from '../scripts/custom-components.module';
import {
    CustomModulesModule
} from '../scripts/custom-modules.module';
const routes: Routes = [{
    path: '',
    component: tabs,
    children: [{
            path: 'dictionaries',
            children: [{
                path: '',
                loadChildren: () =>
                    import ('../dictionaries/dictionaries.module').then(m => m.dictionariesPageModule)
            }]
        },
        {
            path: 'mydictionary',
            children: [{
                path: '',
                loadChildren: () =>
                    import ('../mydictionary/mydictionary.module').then(m => m.mydictionaryPageModule)
            }]
        },
        {
            path: 'settings',
            children: [{
                path: '',
                loadChildren: () =>
                    import ('../settings/settings.module').then(m => m.settingsPageModule)
            }]
        },
        {
            path: '',
            redirectTo: 'dictionaries',
            pathMatch: 'full'
        }
    ]
}];
@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class PageRoutingModule {}
@NgModule({
    declarations: [
        tabs
    ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        PipesModule,
        DirectivesModule,
        ComponentsModule,
        ApperyioDeclarablesModule,
        CustomComponentsModule,
        CustomModulesModule, PageRoutingModule,
        ApperyioTranslateModule
    ],
    exports: [
        tabs
    ]
})
export class tabsPageModule {}