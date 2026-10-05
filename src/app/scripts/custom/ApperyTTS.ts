import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApperyioHelperService } from '../apperyio/apperyio_helper';

export interface ApperyTTSVoice {
    name: string;
    language: string;
    identifier: string;
    voiceURI?: string;
    localService?: boolean;
    default?: boolean;
    quality?: number;
}

export interface ApperyTTSSpeakOptions {
    text: string;
    locale?: string;
    lang?: string;
    identifier?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    cancel?: boolean;
}

declare global {
    interface Window {
        TTS?: {
            speak(textOrOptions: string | ApperyTTSSpeakOptions): Promise<void>;
            stop(): Promise<void>;
            getVoices(): Promise<ApperyTTSVoice[]>;
            getLanguages(): Promise<string[]>;
            checkLanguage(): Promise<string | string[]>;
            openInstallTts(): Promise<void>;
        };
        cordova?: any;
    }
}

@Injectable({
    providedIn: 'root'
})
export class ApperyTTS {
    private get synth(): SpeechSynthesis | null {
        return typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis : null;
    }

    private $a: ApperyioHelperService;
    private $v: any;
    constructor(private Apperyio: ApperyioHelperService, private ngZone: NgZone) {
      this.$a = this.Apperyio;
      this.$v = this.Apperyio.vars;
    }


    private waitForWebVoices(timeoutMs = 3000): Promise<SpeechSynthesisVoice[]> {
        return new Promise((resolve) => {
            const synth = this.synth;
            if (!synth) {
                resolve([]);
                return;
            }

            const existing = synth.getVoices();
            if (existing && existing.length) {
                resolve(existing);
                return;
            }

            let done = false;
            const started = Date.now();
            let poll: any;
            let timer: any;
            const finish = () => {
                if (done) {
                    return;
                }
                const voices = synth.getVoices() || [];
                if (!voices.length && Date.now() - started < timeoutMs) {
                    return;
                }
                done = true;
                clearInterval(poll);
                clearTimeout(timer);
                synth.removeEventListener('voiceschanged', onChanged);
                resolve(voices);
            };
            const onChanged = () => finish();
            synth.addEventListener('voiceschanged', onChanged);
            poll = setInterval(finish, 100);
            timer = setTimeout(finish, timeoutMs);
        });
    }

    private mapWebVoice(voice: SpeechSynthesisVoice): ApperyTTSVoice {
        return {
            name: voice.name,
            language: voice.lang,
            identifier: voice.voiceURI || voice.name,
            voiceURI: voice.voiceURI || voice.name,
            localService: !!voice.localService,
            default: !!voice.default
        };
    }

    private normalizeLanguages(value: string | string[]): string[] {
        if (Array.isArray(value)) {
            return value.filter(Boolean).sort();
        }
        if (!value) {
            return [];
        }
        return String(value)
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
            .filter((item, index, arr) => arr.indexOf(item) === index)
            .sort();
    }

    async getVoices(): Promise<ApperyTTSVoice[]> {
        if (window.TTS && typeof window.TTS.getVoices === 'function') {
            const voices = await window.TTS.getVoices();
            return this.ngZone.run(() => voices || []);
        }

        const voices = await this.waitForWebVoices();
        return this.ngZone.run(() => voices.map((voice) => this.mapWebVoice(voice)));
    }

    async getLanguages(): Promise<string[]> {
        if (window.TTS && typeof window.TTS.getLanguages === 'function') {
            const languages = await window.TTS.getLanguages();
            return this.ngZone.run(() => this.normalizeLanguages(languages));
        }

        if (window.TTS && typeof window.TTS.checkLanguage === 'function') {
            const languages = await window.TTS.checkLanguage();
            return this.ngZone.run(() => this.normalizeLanguages(languages));
        }

        const voices = await this.getVoices();
        const map: { [key: string]: boolean } = {};
        voices.forEach((voice) => {
            if (voice.language) {
                map[voice.language] = true;
            }
        });
        return this.ngZone.run(() => Object.keys(map).sort());
    }

    async speak(textOrOptions: string | ApperyTTSSpeakOptions): Promise<void> {
        const options: ApperyTTSSpeakOptions =
            typeof textOrOptions === 'string' ? { text: textOrOptions } : { ...(textOrOptions || { text: '' }) };

        if (!options.locale && options.lang) {
            options.locale = options.lang;
        }
        
        if (!options.rate) options.rate = this.$a.isMobile() && this.$a.isIOS() ? 0.5 : 1;

        if (window.TTS && typeof window.TTS.speak === 'function' && window.cordova) {
            await window.TTS.speak(options);
            return;
        }

        await this.speakWeb(options);
    }

    private async speakWeb(options: ApperyTTSSpeakOptions): Promise<void> {
        const synth = this.synth;
        if (!synth) {
            throw new Error('Speech synthesis is not supported in this browser');
        }

        if (options.cancel !== false) {
            synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(options.text || '');
        if (options.locale) {
            utterance.lang = options.locale;
        }
        if (typeof options.rate === 'number') {
            utterance.rate = options.rate;
        }
        if (typeof options.pitch === 'number') {
            utterance.pitch = options.pitch;
        }
        if (typeof options.volume === 'number') {
            utterance.volume = options.volume;
        }

        const voices = await this.waitForWebVoices();
        let selected: SpeechSynthesisVoice | undefined;
        if (options.identifier) {
            selected = voices.find(
                (voice) => voice.voiceURI === options.identifier || voice.name === options.identifier
            );
        }
        if (!selected && options.locale) {
            const locale = options.locale.toLowerCase();
            selected =
                voices.find((voice) => (voice.lang || '').toLowerCase() === locale) ||
                voices.find((voice) => (voice.lang || '').toLowerCase().indexOf(locale.split('-')[0]) === 0);
        }
        if (selected) {
            utterance.voice = selected;
            utterance.lang = selected.lang || utterance.lang;
        }

        return new Promise<void>((resolve, reject) => {
            utterance.onend = () => this.ngZone.run(() => resolve());
            utterance.onerror = (event) =>
                this.ngZone.run(() => {
                    if (event && event.error === 'interrupted') {
                        resolve();
                        return;
                    }
                    reject(event && event.error ? event.error : 'ERR_UNKNOWN');
                });
            synth.speak(utterance);
        });
    }

    async stop(): Promise<void> {
        if (window.TTS && typeof window.TTS.stop === 'function' && window.cordova) {
            await window.TTS.stop();
            return;
        }
        if (this.synth) {
            this.synth.cancel();
        }
    }

    async openInstallTts(): Promise<void> {
        if (window.TTS && typeof window.TTS.openInstallTts === 'function') {
            await window.TTS.openInstallTts();
        }
    }
}
export { ApperyTTS as ExportedClass };
