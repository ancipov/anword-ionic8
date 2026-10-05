import {
    NgModule
} from '@angular/core';
import {
    Routes,
    RouterModule
} from '@angular/router';
import {
    ExportedClass as SecurityGuard
} from './scripts/custom/SecurityGuard';
const routes: Routes = [{
        path: '',
        redirectTo: 'start',
        pathMatch: 'full'
    },
    {
        path: 'pages',
        loadChildren: () =>
            import ('./tabs/tabs.module').then(m => m.tabsPageModule),
        canActivate: [SecurityGuard],
    },
    {
        path: 'signup',
        loadChildren: () =>
            import ('./signup/signup.module').then(m => m.signupPageModule),
    },
    {
        path: 'pages/dictionaries',
        loadChildren: () =>
            import ('./dictionaries/dictionaries.module').then(m => m.dictionariesPageModule),
        canActivate: [SecurityGuard],
    },
    {
        path: 'pages/entries',
        loadChildren: () =>
            import ('./entries/entries.module').then(m => m.entriesPageModule),
    },
    {
        path: 'login',
        loadChildren: () =>
            import ('./login/login.module').then(m => m.loginPageModule),
    },
    {
        path: 'privacypolicy',
        loadChildren: () =>
            import ('./privacypolicy/privacypolicy.module').then(m => m.privacypolicyPageModule),
    },
    {
        path: 'pages/settings',
        loadChildren: () =>
            import ('./settings/settings.module').then(m => m.settingsPageModule),
        canActivate: [SecurityGuard],
    },
    {
        path: 'code',
        loadChildren: () =>
            import ('./code/code.module').then(m => m.codePageModule),
        canActivate: [SecurityGuard],
    },
    {
        path: 'pages/profile',
        loadChildren: () =>
            import ('./profile/profile.module').then(m => m.profilePageModule),
        canActivate: [SecurityGuard],
    },
    {
        path: 'forgotpassword',
        loadChildren: () =>
            import ('./forgotpassword/forgotpassword.module').then(m => m.forgotpasswordPageModule),
    },
    {
        path: 'removeaccount',
        loadChildren: () =>
            import ('./removeaccount/removeaccount.module').then(m => m.removeaccountPageModule),
    },
    {
        path: 'termsofservices',
        loadChildren: () =>
            import ('./termsofservices/termsofservices.module').then(m => m.termsofservicesPageModule),
    },
    {
        path: 'start',
        loadChildren: () =>
            import ('./start/start.module').then(m => m.startPageModule),
    },
    {
        path: 'play/:id',
        loadChildren: () =>
            import ('./play/play.module').then(m => m.playPageModule),
        canActivate: [SecurityGuard],
    },
    {
        path: 'texttospeechscreen',
        loadChildren: () =>
            import ('./texttospeechscreen/texttospeechscreen.module').then(m => m.texttospeechscreenPageModule),
    },
    {
        path: 'speechrecognition',
        loadChildren: () =>
            import ('./speechrecognition/speechrecognition.module').then(m => m.speechrecognitionPageModule),
    },
    {
        path: 'pages/mydictionary',
        loadChildren: () =>
            import ('./mydictionary/mydictionary.module').then(m => m.mydictionaryPageModule),
        canActivate: [SecurityGuard],
    },
    {
        path: 'searchableselectscreen',
        loadChildren: () =>
            import ('./searchableselectscreen/searchableselectscreen.module').then(m => m.searchableselectscreenPageModule),
    },
    {
        path: 'deepseek',
        loadChildren: () =>
            import ('./deepseek/deepseek.module').then(m => m.deepseekPageModule),
    },
    {
        path: 'translation',
        loadChildren: () =>
            import ('./translation/translation.module').then(m => m.translationPageModule),
    },
    {
        path: 'pages/dictionaries/:id',
        loadChildren: () =>
            import ('./dictionary/dictionary.module').then(m => m.dictionaryPageModule),
        canActivate: [SecurityGuard],
    },
    {
        path: '**',
        loadChildren: () =>
            import ('./pagenotfound/pagenotfound.module').then(m => m.pagenotfoundPageModule),
    },
];
@NgModule({
    imports: [RouterModule.forRoot(
        routes, {
            enableTracing: false,
            useHash: true
        }
    )],
    exports: [RouterModule]
})
export class AppRoutingModule {}