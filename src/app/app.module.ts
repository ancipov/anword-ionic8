import {
    NgModule
} from '@angular/core';
import {
    BrowserModule
} from '@angular/platform-browser';
import {
    BrowserAnimationsModule
} from '@angular/platform-browser/animations';
import {
    FormsModule
} from '@angular/forms';
import {
    HttpClientModule
} from '@angular/common/http';
import {
    IonicModule
} from '@ionic/angular';
import {
    IonicStorageModule
} from '@ionic/storage-angular';
import {
    ApperyioModule
} from './scripts/apperyio/apperyio.module';
import {
    ApperyioDeclarablesModule
} from './scripts/apperyio/declarables/apperyio.declarables.module';
import {
    PipesModule
} from './scripts/pipes.module';
import {
    DirectivesModule
} from './scripts/directives.module';
import {
    ComponentsModule
} from './scripts/components.module';
import {
    CustomComponentsModule
} from './scripts/custom-components.module';
import {
    CustomModulesModule
} from './scripts/custom-modules.module';
import {
    Sanitizer
} from '@angular/core';
import {
    NgDompurifySanitizer
} from '@tinkoff/ng-dompurify';
import {
    createTranslateLoader
} from './scripts/apperyio/translate_module';
import {
    TranslateModule
} from '@ngx-translate/core';
import {
    TranslateLoader
} from '@ngx-translate/core';
import {
    HttpClient
} from '@angular/common/http';
import {
    app
} from './app';
import {
    AppRoutingModule
} from './app-routing.module';
import {
    PwaService
} from './scripts/apperyio/pwa_service';
import {
    APP_INITIALIZER
} from '@angular/core';
import {
    entry
} from './entry/entry';
import {
    camera
} from './camera/camera';
import {
    changepassword
} from './changepassword/changepassword';
import {
    cropimage
} from './cropimage/cropimage';
import {
    speechrecognitionmodal
} from './speechrecognitionmodal/speechrecognitionmodal';
import {
    ExportedClass as ApperySpeech
} from './scripts/custom/ApperySpeech';
import {
    ExportedClass as ApperyTTS
} from './scripts/custom/ApperyTTS';
import {
    BuildInfo
} from '@awesome-cordova-plugins/build-info/ngx';
import {
    Camera
} from '@awesome-cordova-plugins/camera/ngx';
import {
    FingerprintAIO
} from '@awesome-cordova-plugins/fingerprint-aio/ngx';
import {
    SpeechRecognition
} from '@awesome-cordova-plugins/speech-recognition/ngx';
import {
    InAppBrowser
} from '@awesome-cordova-plugins/in-app-browser/ngx';
import {
    Media
} from '@awesome-cordova-plugins/media/ngx';
import {
    OpenNativeSettings
} from '@awesome-cordova-plugins/open-native-settings/ngx';
import {
    GooglePlus
} from '@awesome-cordova-plugins/google-plus/ngx';
import {
    HTTP
} from '@awesome-cordova-plugins/http/ngx';
import {
    File
} from '@awesome-cordova-plugins/file/ngx';
import {
    Dialogs
} from '@awesome-cordova-plugins/dialogs/ngx';
import {
    Globalization
} from '@awesome-cordova-plugins/globalization/ngx';
import {
    WebView
} from '@awesome-cordova-plugins/ionic-webview/ngx';
import {
    Device
} from '@awesome-cordova-plugins/device/ngx';
import {
    SplashScreen
} from '@awesome-cordova-plugins/splash-screen/ngx';
import {
    StatusBar
} from '@awesome-cordova-plugins/status-bar/ngx';
import {
    Keyboard
} from '@awesome-cordova-plugins/keyboard/ngx';
import {
    Network
} from '@awesome-cordova-plugins/network/ngx';
import {
    SecureStorage
} from '@awesome-cordova-plugins/secure-storage/ngx';
import {
    CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import 'hammerjs';
import {
    HammerModule
} from '@angular/platform-browser';
import {
    GoogleLoginProvider,
    SocialLoginModule,
    SocialAuthServiceConfig
} from '@abacritt/angularx-social-login';
import {
    constants
} from './scripts/constants';
( < any > NgDompurifySanitizer.prototype)._sanitize_fn = NgDompurifySanitizer.prototype.sanitize;
NgDompurifySanitizer.prototype.sanitize = function(...args) {
    let value: any = args[1];
    if (value && value.hasOwnProperty("changingThisBreaksApplicationSecurity")) {
        args[1] = value.changingThisBreaksApplicationSecurity
    }
    return this._sanitize_fn(...args);
}
var getIonicModuleConfig, getIonicStorageModuleConfig;
getIonicModuleConfig = () => {
    let config = {
        animated: false
    };
    return config;
}
const initializer = (pwaService: PwaService) => () => pwaService.initPwaPrompt();
@NgModule({
    declarations: [
        app, entry, camera, changepassword, cropimage, speechrecognitionmodal
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        IonicModule.forRoot({
            ...{
                innerHTMLTemplatesEnabled: true
            },
            ...((typeof getIonicModuleConfig === "function")? getIonicModuleConfig(): {})
        }),
        HttpClientModule,
        ApperyioModule,
        PipesModule,
        DirectivesModule,
        ComponentsModule,
        ApperyioDeclarablesModule,
        CustomComponentsModule,
        CustomModulesModule,
        IonicStorageModule.forRoot((typeof getIonicStorageModuleConfig === "function")? getIonicStorageModuleConfig(): undefined), HammerModule,
        SocialLoginModule,
        AppRoutingModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        })
    ],
    bootstrap: [
        app
    ],
    providers: [
        StatusBar,
        SplashScreen,
        WebView,
        Device,
        Keyboard,
        Network,
        SecureStorage,
        {
            provide: Sanitizer,
            useClass: NgDompurifySanitizer,
        },
        {
            provide: APP_INITIALIZER,
            useFactory: initializer,
            deps: [PwaService],
            multi: true
        },
        BuildInfo,
        Camera,
        FingerprintAIO,
        SpeechRecognition,
        InAppBrowser,
        Media,
        OpenNativeSettings,
        GooglePlus,
        HTTP,
        File,
        Dialogs,
        Globalization,
        ApperySpeech,
        ApperyTTS,
        {
            provide: 'SocialAuthServiceConfig',
            useValue: {
                autoLogin: false,
                providers: [{
                    id: GoogleLoginProvider.PROVIDER_ID,
                    provider: new GoogleLoginProvider(constants.Settings.GoogleClientId)
                }]
            }
        }
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class AppModule {}