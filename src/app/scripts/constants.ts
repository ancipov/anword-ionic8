let _constants: any = {
    /**
     * Settings
     * @property databaseId       - 
     * @property GoogleClientId       - 
     * @property iosBundleId       - 
     * @property confirmationCodeScriptId       - 
     * @property removeUserScriptId       - 
     * @property resendCodeScriptId       - 
     * @property resetPasswordCheckUsernameScriptId       - 
     * @property resetPasswordSetPasswordScriptId       - 
     * @property removeUserWebPageScriptId       - 
     * @property configScriptId       - 
     * @property unlinkDeviceScriptId       - 
     * @property sendPushScriptId       - 
     * @property changePasswordScriptId       - 
     * @property googleLoginScriptId       - 
     * @property updateUserScriptId       - 
     * @property loginScriptId       - 
     * @property signupScriptId       - 
     * @property anwordDeepSeekServiceId       - 
     */
    Settings: {
        "databaseId": "69e33a3ae02e82702748f86e",
        "GoogleClientId": "273052470896-0b099atqshh0091vff0d96k7lfphbgul.apps.googleusercontent.com",
        "iosBundleId": "id737478069",
        "confirmationCodeScriptId": "e868fb56-aa88-47b2-a31b-4e6a826c7542",
        "removeUserScriptId": "36173d5d-ed51-423b-a4b7-b933d2d5eaeb",
        "resendCodeScriptId": "42fa1880-1465-42cd-9e8c-ad14e791fdc9",
        "resetPasswordCheckUsernameScriptId": "f2042c14-bae3-4692-a310-12a649b21fc4",
        "resetPasswordSetPasswordScriptId": "3b5cd4a1-c883-43f8-9a16-e4fd667f4293",
        "removeUserWebPageScriptId": "c1dfa9ca-4f2a-4f28-82a3-780c828e524f",
        "configScriptId": "b500ac84-6922-406a-8244-86aa410d718b",
        "unlinkDeviceScriptId": "09939ae5-9f38-4d23-8fbf-177a855f0915",
        "sendPushScriptId": "5800b0f5-e7ba-49a4-a540-2274b3d19393",
        "changePasswordScriptId": "a601ac3a-2380-4104-a324-78ce757e528d",
        "googleLoginScriptId": "3d4e7f90-3096-41c7-b8c2-c8c45ec98e49",
        "updateUserScriptId": "c81ad263-d1d7-44f0-8290-2c21e17df072",
        "loginScriptId": "72fa42e4-a5fa-48fd-afe6-6ede56a73f9e",
        "signupScriptId": "3ad41a10-c847-42bf-94ea-99fab00e3ed3",
        "anwordDeepSeekServiceId": "d73c5fb0-3890-4589-aa2f-757852da7fac"
    }
};
if (window.AIO_ENV_SETTINGS) {
    if (!_constants.Settings) {
        _constants.Settings = {};
    }
    if (!window.AIO_ENV_NAME) {
        if (/[\-_ ]dev$/.test((window.document.title || "").toLowerCase())) {
            window.AIO_ENV_NAME = "dev";
        } else {
            window.AIO_ENV_NAME = "prod";
        }
    }
    var keys = Object.keys(window.AIO_ENV_SETTINGS);
    for (var i = 0; i < keys.length; i++) {
        if (window.AIO_ENV_SETTINGS[keys[i]].hasOwnProperty(window.AIO_ENV_NAME)) {
            _constants.Settings[keys[i]] = window.AIO_ENV_SETTINGS[keys[i]][window.AIO_ENV_NAME];
        }
    }
}
export const constants = _constants;
export const routes = {
    "tabs": "pages",
    "signup": "signup",
    "dictionaries": "pages/dictionaries",
    "entries": "pages/entries",
    "login": "login",
    "privacypolicy": "privacypolicy",
    "settings": "pages/settings",
    "code": "code",
    "profile": "pages/profile",
    "forgotpassword": "forgotpassword",
    "removeaccount": "removeaccount",
    "termsofservices": "termsofservices",
    "pagenotfound": "**",
    "start": "start",
    "play": "play/:id",
    "texttospeechscreen": "texttospeechscreen",
    "speechrecognition": "speechrecognition",
    "mydictionary": "pages/mydictionary",
    "searchableselectscreen": "searchableselectscreen",
    "deepseek": "deepseek",
    "translation": "translation",
    "dictionarydetails": "pages/dictionaries/:id",
};
export const pushSettings = {
    appID: '41754129-1d83-4c70-8e02-5600dc4ac32f',
    baseUrl: 'https://api.appery.io/rest/push/reg',
    baseSendUrl: 'https://api.appery.io/rest/push/msg',
    initOptions: {}
};
export const projectInfo = {
    guid: "41754129-1d83-4c70-8e02-5600dc4ac32f",
    name: "Anword",
    description: "The application designed to help you learn foreign vocabulary by heart."
};
export const pwaInfo = {
    name: 'Anword',
    shortName: 'Anword',
    description: '',
    icon: 'assets/images/note.png'
};
export const IGNORED_VALUE = Symbol.for("AIO_REST_IGNORED_VALUE");
export const apiHost = "https://api.appery.io";
export const defaultProxy = "234122c7-6ddc-47cf-9c73-15c60e6f8e52";