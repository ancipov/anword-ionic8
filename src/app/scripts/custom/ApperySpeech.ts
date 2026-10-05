import {
    Injectable
} from '@angular/core';
import {
    ApperyioHelperService
} from '../apperyio/apperyio_helper';

/**
 * BCP-47 language tags commonly accepted by browser Web Speech recognition
 * (Chrome / Chromium cloud recognition and engines that mirror that set).
 */
const WEB_SPEECH_LANGUAGE_CANDIDATES: string[] = [
    'af-ZA', 'am-ET', 'hy-AM', 'az-AZ', 'id-ID', 'ms-MY', 'bn-BD', 'bn-IN',
    'ca-ES', 'cs-CZ', 'da-DK', 'de-DE',
    'en-AU', 'en-CA', 'en-GH', 'en-GB', 'en-IN', 'en-IE', 'en-KE', 'en-NZ',
    'en-NG', 'en-PH', 'en-SG', 'en-ZA', 'en-TZ', 'en-US',
    'es-AR', 'es-BO', 'es-CL', 'es-CO', 'es-CR', 'es-EC', 'es-SV', 'es-ES',
    'es-US', 'es-GT', 'es-HN', 'es-MX', 'es-NI', 'es-PA', 'es-PY', 'es-PE',
    'es-PR', 'es-DO', 'es-UY', 'es-VE',
    'eu-ES', 'fil-PH', 'fr-CA', 'fr-FR', 'gl-ES', 'ka-GE', 'gu-IN', 'hr-HR',
    'zu-ZA', 'is-IS', 'it-IT', 'jv-ID', 'kn-IN', 'km-KH', 'lo-LA', 'lv-LV',
    'lt-LT', 'hu-HU', 'ml-IN', 'mr-IN', 'nl-NL', 'ne-NP', 'nb-NO', 'pl-PL',
    'pt-BR', 'pt-PT', 'ro-RO', 'si-LK', 'sk-SK', 'sl-SI', 'su-ID', 'sw-TZ',
    'sw-KE', 'fi-FI', 'sv-SE', 'ta-IN', 'ta-SG', 'ta-LK', 'ta-MY', 'te-IN',
    'vi-VN', 'tr-TR', 'ur-PK', 'ur-IN', 'el-GR', 'bg-BG', 'ru-RU', 'sr-RS',
    'uk-UA', 'he-IL',
    'ar-IL', 'ar-JO', 'ar-AE', 'ar-BH', 'ar-DZ', 'ar-SA', 'ar-IQ', 'ar-KW',
    'ar-MA', 'ar-TN', 'ar-OM', 'ar-PS', 'ar-QA', 'ar-LB', 'ar-EG',
    'fa-IR', 'hi-IN', 'th-TH', 'ko-KR', 'zh-TW', 'yue-Hant-HK', 'ja-JP',
    'zh-HK', 'zh-CN'
];

export interface ApperySpeechStartOptions {
    lang?: string;
    silenceMs?: number;
    onResult?: (text: string) => void;
    onSilence?: () => void;
    onFatalError?: (message: string) => void;
}

@Injectable({
    providedIn: 'root'
})
export class ApperySpeech {
    private text = '';
    private lang = 'en-US';
    private silenceMs = 4000;
    private stopped = true;
    private webSpeechRecognition: any;
    private silenceTimer: any;
    private restartTimer: any;
    private deviceSub: any;
    private onResult: ((text: string) => void) | null = null;
    private onSilence: (() => void) | null = null;
    private onFatalError: ((message: string) => void) | null = null;
    private browserLanguagesCache: string[] | null = null;
    private $a: ApperyioHelperService;
    private $v: any;

    constructor(private Apperyio: ApperyioHelperService) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
    }

    getSpeechRecognitionAPI(): any {
        return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    }

    isBrowserSupported(): boolean {
        return !!this.getSpeechRecognitionAPI();
    }

    getRecognizedText(): string {
        return this.text;
    }

    getLanguageLabel(code: string): string {
        if (!code) return '';
        try {
            const locale = navigator.language || 'en';
            const parts = code.split('-');
            const languageNames = new (Intl as any).DisplayNames([locale], {
                type: 'language'
            });
            const langLabel = languageNames.of(parts[0]) || parts[0];
            if (parts.length === 1) {
                return `${langLabel} (${code})`;
            }
            const regionCode = parts[parts.length - 1];
            if (/^[A-Z]{2}$/i.test(regionCode) || /^[0-9]{3}$/.test(regionCode)) {
                try {
                    const regionNames = new (Intl as any).DisplayNames([locale], {
                        type: 'region'
                    });
                    const regionLabel = regionNames.of(regionCode.toUpperCase());
                    if (regionLabel) {
                        return `${langLabel} (${regionLabel}) — ${code}`;
                    }
                } catch (e) {}
            }
            return `${langLabel} — ${code}`;
        } catch (e) {
            return code;
        }
    }

    async ensureReady(): Promise<boolean> {
        if (this.$a.isBrowser()) {
            if (!this.isBrowserSupported()) {
                await this.$a.alert('Speech recognition is not supported in this browser.');
                return false;
            }
            return true;
        }
        try {
            const available = await this.$a.native.speechRecognition.isRecognitionAvailable();
            if (!available) {
                await this.$a.alertAsync('Recognition is not available on this device.');
                
                window.cordova?.plugins?.settings?.open("application_details");
                                
                return false;
            }
            const has = await this.$a.native.speechRecognition.hasPermission();
            if (!has) {
                try {
                    await this.$a.native.speechRecognition.requestPermission();
                } catch (e) {
                    await this.$a.alertAsync('Recognition permission was not provided. Enable microphone access in Settings.');
                    
                    window.cordova?.plugins?.settings?.open("application_details");
                    
                    return false;
                }
            }
            return true;
        } catch (e) {
            console.log(e);
            await this.$a.alertAsync('Recognition permission was not provided');
            
            window.cordova?.plugins?.settings?.open("application_details");
            
            return false;
        }
    }

    async getSupportedLanguages(): Promise<string[]> {
        if (this.$a.isBrowser()) {
            return this.getBrowserSupportedLanguages();
        }
        try {
            const available = await this.$a.native.speechRecognition.isRecognitionAvailable();
            if (!available) {
                return [];
            }
            // getSupportedLanguages does not require mic/speech permission (iOS/Android plugin)
            const languages = await this.$a.native.speechRecognition.getSupportedLanguages();
            const normalized = this.normalizeLanguageList(languages);
            if (normalized.length) {
                return normalized;
            }
        } catch (e) {
            console.log('getSupportedLanguages failed', e);
        }
        // Android 11+ GET_LANGUAGE_DETAILS broadcast can return empty without package visibility;
        // fall back to the common Web Speech / Google STT set so the dropdown still works.
        return this.normalizeLanguageList(WEB_SPEECH_LANGUAGE_CANDIDATES);
    }

    private normalizeLanguageList(languages: any): string[] {
        if (!Array.isArray(languages)) {
            return [];
        }
        const normalized = languages
            .map((lang) => String(lang || '').trim().replace(/_/g, '-'))
            .filter((lang) => !!lang);
        return Array.from(new Set(normalized)).sort((a, b) => a.localeCompare(b));
    }

    private async getBrowserSupportedLanguages(): Promise<string[]> {
        if (!this.isBrowserSupported()) {
            return [];
        }
        if (this.browserLanguagesCache) {
            return this.browserLanguagesCache;
        }

        const API = this.getSpeechRecognitionAPI();
        let languages: string[] = [];

        if (API && typeof API.available === 'function') {
            languages = await this.filterLanguagesWithAvailable(API, WEB_SPEECH_LANGUAGE_CANDIDATES);
        }

        if (!languages.length) {
            languages = [...WEB_SPEECH_LANGUAGE_CANDIDATES];
        }

        const browserLang = (navigator.language || '').trim();
        if (browserLang && !languages.includes(browserLang)) {
            languages = [browserLang, ...languages];
        }

        languages = Array.from(new Set(languages)).sort((a, b) => a.localeCompare(b));
        this.browserLanguagesCache = languages;
        return languages;
    }

    private async filterLanguagesWithAvailable(API: any, candidates: string[]): Promise<string[]> {
        const supported: string[] = [];
        const batchSize = 8;
        for (let i = 0; i < candidates.length; i += batchSize) {
            const batch = candidates.slice(i, i + batchSize);
            await Promise.all(batch.map(async (lang) => {
                try {
                    const status = await API.available({
                        langs: [lang],
                        processLocally: false
                    });
                    if (status === 'available') {
                        supported.push(lang);
                    }
                } catch (e) {
                    // language not queryable in this browser — skip
                }
            }));
        }
        return supported;
    }

    async start(options: ApperySpeechStartOptions = {}): Promise<void> {
        await this.cleanup();
        this.stopped = false;
        this.text = '';
        this.lang = options.lang || 'en-US';
        this.silenceMs = options.silenceMs != null ? options.silenceMs : 4000;
        this.onResult = options.onResult || null;
        this.onSilence = options.onSilence || null;
        this.onFatalError = options.onFatalError || null;

        if (this.$a.isBrowser()) {
            this.recognizeWeb();
        } else {
            this.recognizeDevice();
        }
    }

    async stop(): Promise<string> {
        if (this.stopped) {
            return this.text;
        }
        this.stopped = true;
        await this.cleanup();
        return this.text;
    }

    private emitResult(text: string): void {
        this.text = text;
        if (this.onResult) {
            this.onResult(text);
        }
    }

    private emitFatalError(message: string): void {
        this.stopped = true;
        this.cleanup();
        if (this.onFatalError) {
            this.onFatalError(message);
        } else {
            this.$a.alert(message);
        }
    }

    private recognizeWeb(): void {
        const SpeechRecognitionAPI = this.getSpeechRecognitionAPI();
        if (!SpeechRecognitionAPI) {
            this.emitFatalError('Speech recognition is not supported in this browser.');
            return;
        }
        try {
            this.webSpeechRecognition = new SpeechRecognitionAPI();
        } catch (e) {
            this.emitFatalError('Unable to start speech recognition in this browser.');
            return;
        }
        this.webSpeechRecognition.lang = this.lang || 'en-US';
        this.webSpeechRecognition.continuous = true;
        this.webSpeechRecognition.interimResults = true;
        this.resetSilenceTimer();
        this.webSpeechRecognition.onresult = (event) => {
            if (this.stopped) return;
            if (event.results.length > 0) {
                this.resetSilenceTimer();
                let text = '';
                for (let i = 0; i < event.results.length; i++) {
                    text += event.results[i][0].transcript;
                }
                if (this.$a.isBrowser() && this.$a.isAndroid()) {
                    text = event.results[event.results.length - 1][0].transcript;
                }
                this.emitResult(text);
            }
        };
        this.webSpeechRecognition.onend = () => {
            if (this.stopped) return;
            try {
                this.webSpeechRecognition.start();
            } catch (e) {
                if (this.restartTimer) clearTimeout(this.restartTimer);
                this.restartTimer = setTimeout(() => {
                    if (this.stopped) return;
                    try {
                        this.webSpeechRecognition.start();
                    } catch (err) {
                        console.log(err);
                    }
                }, 300);
            }
        };
        this.webSpeechRecognition.onerror = (event) => {
            if (this.stopped) return;
            const error = event && event.error;
            if (error === 'not-allowed' || error === 'service-not-allowed') {
                this.emitFatalError('Microphone permission is required for speech recognition.');
                return;
            }
            if (error === 'language-not-supported') {
                this.emitFatalError('Selected language is not supported by speech recognition in this browser.');
                return;
            }
            if (error === 'no-speech' || error === 'aborted' || error === 'audio-capture') {
                return;
            }
            console.log('web speech error', error);
        };
        try {
            this.webSpeechRecognition.start();
        } catch (e) {
            this.emitFatalError('Unable to start speech recognition. Check microphone permission.');
        }
    }

    private recognizeDevice(): void {
        this.resetSilenceTimer();
        this.startDeviceListening();
    }

    checkMicrophonePermission(): Promise<boolean> {
        return new Promise((resolve) => {
            if (this.$a.isBrowser()) {
                resolve(true);
            } else if (navigator.permissions) {
                navigator.permissions.query(<any>{
                    name: 'microphone'
                }).then((status) => {
                    if (status.state === 'granted') {
                        console.log('Microphone access is granted');
                        resolve(true);
                    } else if (status.state === 'prompt') {
                        console.log('Microphone permission has not been granted yet');
                        (window as any).cordova.plugins.settings.open('application_details');
                    } else {
                        console.log('Microphone access is denied');
                        resolve(false);
                    }
                });
            } else {
                resolve(false);
            }
        });
    }

    private async cleanup(): Promise<void> {
        try {
            if (this.silenceTimer) clearTimeout(this.silenceTimer);
            if (this.restartTimer) clearTimeout(this.restartTimer);
            this.silenceTimer = null;
            this.restartTimer = null;
            if (this.$a.isBrowser()) {
                try {
                    if (this.webSpeechRecognition) {
                        this.webSpeechRecognition.onend = null;
                        this.webSpeechRecognition.onerror = null;
                        this.webSpeechRecognition.onresult = null;
                        this.webSpeechRecognition.stop();
                        this.webSpeechRecognition.abort();
                    }
                } catch (e) {
                    console.log(e);
                }
                this.webSpeechRecognition = null;
            } else {
                if (this.deviceSub) {
                    this.deviceSub.unsubscribe();
                    this.deviceSub = null;
                }
                try {
                    await this.$a.native.speechRecognition.stopListening();
                } catch (e) {
                    console.log(e);
                }
            }
        } catch (e) {
            this.$a.showError(e);
        }
    }

    private resetSilenceTimer(): void {
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        this.silenceTimer = setTimeout(() => {
            if (this.onSilence) {
                this.onSilence();
            }
        }, this.silenceMs);
    }

    private scheduleDeviceRestart(): void {
        if (this.stopped) return;
        if (this.restartTimer) clearTimeout(this.restartTimer);
        this.restartTimer = setTimeout(() => {
            this.startDeviceListening();
        }, 100);
    }

    private isRecoverableRecognitionError(err: any): boolean {
        const msg = String(err && (err.message || err) || '');
        return /no match|no speech|client side|busy|timeout|server disconnected|network/i.test(msg);
    }

    private startDeviceListening(): void {
        if (this.stopped) return;
        if (this.deviceSub) {
            this.deviceSub.unsubscribe();
            this.deviceSub = null;
        }
        this.deviceSub = this.$a.native.speechRecognition.startListening(<any>{
                language: this.lang || 'en-US',
                matches: 1,
                showPartial: true,
                showPopup: false,
                completeSilenceLength: this.silenceMs,
                possiblyCompleteSilenceLength: this.silenceMs
            })
            .subscribe({
                next: (matches: string[]) => {
                    if (this.stopped) return;
                    if (matches && matches.length > 0) {
                        this.emitResult(matches[0]);
                        this.resetSilenceTimer();
                    }
                },
                error: (error) => {
                    console.log('error', error);
                    if (this.stopped) return;
                    if (this.isRecoverableRecognitionError(error)) {
                        this.scheduleDeviceRestart();
                    } else if (/permission|denied|missing permission/i.test(String(error && (error.message || error) || ''))) {
                        this.emitFatalError('Recognition permission was not provided');
                    } else {
                        this.scheduleDeviceRestart();
                    }
                },
                complete: () => {
                    if (!this.stopped) this.scheduleDeviceRestart();
                }
            });
    }
}

export {
    ApperySpeech as ExportedClass
};
