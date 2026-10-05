/**
 * Models generated from "Model and Storage" and models extracted from services.
 * To generate entity use syntax:
 * Apperyio.EntityAPI("<model_name>[.<model_field>]");
 */
export var models = {
    "String": {
        "type": "string"
    },
    "Number": {
        "type": "number"
    },
    "Any": {
        "type": "any"
    },
    "Function": {
        "type": "Function"
    },
    "Promise": {
        "type": "Promise"
    },
    "Boolean": {
        "type": "boolean"
    },
    "Observable": {
        "type": "Observable"
    }
};
/**
 * Data storage
 */
export const _aioDefStorageValues = {
    variables: {
        "settings": {},
        "profile": {},
        "deepSeekApiKey": '',
        "chatMessages": [
            // {
            //     role: "system",
            //     content: "You are a friendly and knowledgeable travel guide in Milan",
            //     time: new Date().toLocaleTimeString()
            // },
            {
                role: "assistant",
                content: "Hello how can I help you?",
                time: new Date().toLocaleTimeString()
            }
        ],
        "deepSeekModel": 'deepseek-chat',
        "dictionaries": [],
        "mydictionary": {},
        "libraryDictionaries": []
    },
    storages: {
    },
    functions: {
        saveUserDataAndNavigate: async function(loginResult) {
            this.$v.user = loginResult;
            this.$a.db.setSessionToken(loginResult.sessionToken);
            this.$v.sessionToken = loginResult.sessionToken;
            this.$a.db.userSetId(loginResult._id);
            this.$v.profile = await this.$a.db.queryOne("Profiles", {
                where: {
                    userId: loginResult._id
                }
            });
            if (this.$v.originalPage) {
                location.href = this.$v.originalPage;
                this.$v.originalPage = '';
            } else {
                this.$a.navigation.root("tabs");
            }
        },
        saveAutologinData: async function(autoLogin, userCredentials?) {
            this.$a.setLocal("autoLogin", autoLogin);
            if (userCredentials) await this.$a.ssSet('savedUser_' + this.$a.projectInfo?.guid, userCredentials);
            else await this.$a.ssRemove('savedUser_' + this.$a.projectInfo?.guid);
        },
        fullLogout: async function(loginScreen?) {
            try {
                await this.$a.showLoading();
                if (window?.device) await this.$a.sc("unlinkDeviceScriptId", window.device);
                this.$v.logout(loginScreen);
            } catch (e) {
                await this.$a.showError(e);
            }
            await this.$a.dismissLoading();
        },
        logout: async function(loginScreen?) {
            try {
                if (this.$v.profile.provider == "GOOGLE") {
                    if (this.$a.isMobile()) await this.$a.native.googlePlus.logout();
                    else this.$v.authService.signOut();
                }
            } catch (e) {
                console.log(e);
            }
            await this.$v.saveAutologinData(false);
            this.$v.user = null;
            this.$v.profile = null;
            this.$v.sessionToken = undefined;
            await this.$a.db.logout();
            if (loginScreen) this.$a.navigation.root('login')
            else document.location = document.location.origin + document.location.pathname;
        },
        checkBiometric: async function() {
            try {
                await this.$a.native.fingerprintAIO?.isAvailable();
                return true;
            } catch (e) {
                return false;
            }
            return false;
        },
        biometricLogin: async function() {
            try {
                await this.$a.native.fingerprintAIO?.show({
                    description: this.$a.translate.instant('Please authenticate')
                });
                return true;
            } catch (e) {
                return false;
            }
            return false;
        },
        showCodeAlert: async function(isDev) {
            this.$a.alert(
                isDev? `You didn't configure SMTP or SMS server settings. Please add corresponding settings to the StarterLib server code. Dev confirmation code: 12345`:
                `Check your email/SMS for confirmation code`, 'Warning');
        },
        ionViewWillEnter: function() {
            this.$v.saveState();
        },
        ionViewWillLeave: function() {
            this.$v.saveState();
        },
        applyDefaultSettings: async function() {
            this.$v.settings = await this.$a.getStorage("settings") || {
                lang: this.$a.translate.getBrowserLang(),
                darkMode: await this.$a.native.themeDetector.isDarkModeEnabled()
            };
            if (!this.$v.settings.lang) this.$v.settings.lang = 'en';
            this.$a.setTheme(this.$v.settings.darkMode? 'Dark': 'Default');
            this.$a.setLang(this.$v.settings.lang);
            window.AndroidEdgeToEdge?.enable({
                lightStatusBar: this.$v.settings.darkMode,
                lightNavigationBar: this.$v.settings.darkMode,
                backgroundColor: getComputedStyle(document.body).getPropertyValue('--ion-color-dark').trim(),
                // Optional: packages to ignore (prevents issues with plugins like camera)
                ignoredPackages: [
                    'org.apache.cordova.camera',
                    'org.apache.cordova.file'
                ]
            });
        },
        safeParse: function(data) {
            try {
                return JSON.parse(data);
            } catch (e) {}
            return data;
        },
        saveState: function() {
            let names = ['sessionToken', 'settings', 'profile', 'user'];
            let $v = {};
            names.forEach((name) => $v[name] = this.$v[name]);
            this.$a.setSession("$v", $v);
        },
        playSuccess: async function() {
        },
        deepSeekRequest: async function(message) {
            if (!this.$v.deepSeekApiKey) return this.$a.alert(`You need to provide an DeepSeek API key on "Model and Storage" - "Storage" tab, to use DeepSeek.`, "Warning");
            let response: any = await this.$a.post('https://api.deepseek.com/v1/chat/completions', {
                model: this.$v.deepSeekModel,
                messages: typeof message == 'string'? [{
                    role: "user",
                    content: message
                }]: message,
                stream: false
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.$v.deepSeekApiKey}`
                },
                useProxy: true
            })
            return response?.choices?.[0]?.message?.content;
        },
        loadDictionaries: async function() {
            this.$v.dictionaries = await this.$a.getStorage('dictionaries') || [];
            let dictionaryName = 'mydictionary'; // + this.dictionary.from + '-' + this.dictionary.to;
            this.$v.mydictionary = await this.$a.getStorage(dictionaryName) || {
                words: {}
            };
            if (!this.$a.offline) {
                this.$v.dictionaries = await this.$a.db.query('dictionaries', {
                    where: {
                        userId: this.$v.user._id
                    }
                });
                await this.$a.setStorage('dictionaries', this.$v.dictionaries);
                this.$v.mydictionary = await this.$a.db.queryOne('mydictionary', {
                    where: {
                        userId: this.$v.user._id,
                        name: dictionaryName
                    }
                });
                console.log('this.$v.mydictionary', this.$v.mydictionary);
                if (!this.$v.mydictionary) {
                    this.$v.mydictionary = await this.$a.db.save('mydictionary', {
                        userId: this.$v.user._id,
                        name: dictionaryName,
                        words: JSON.stringify({})
                    });
                    console.log('this.$v.mydictionary', this.$v.mydictionary);
                }
                console.log('this.$v.mydictionary', this.$v.mydictionary);
                this.$v.mydictionary.words = JSON.parse(this.$v.mydictionary.words);
                await this.$a.setStorage(dictionaryName, this.$v.mydictionary)
            }
            for (let item of this.$v.dictionaries) {
                let count = 0;
                item.knownWords = 0;
                for (let word of item.words) {
                    if (this.$v.mydictionary.words[word[0]] >= 3) item.knownWords++;
                }
            }
        }
    }
}