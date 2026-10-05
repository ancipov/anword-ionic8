import {
    HttpHeaders
} from '@angular/common/http';

import {
    apiHost, defaultProxy
} from '../../constants';

const _defaultOptions = {
    showError: true,
    loadingStart: false,
    loadingEnd: false,
    throwError: false,
    message: '',
    errorMessage: '',
    cache: false,
    saveInCache: false,
    headers: null
};

let defaultOptions = {..._defaultOptions};

function buildParams( prefix, obj, add ) {
    var name;
    if ( Array.isArray( obj ) ) {
        // Serialize array item.
        obj.forEach( function( v, i ) {
            if ( prefix.endsWith("[]") ) {
                // Treat each array item as a scalar.
                add( prefix, v );
            } else {
                // Item is non-scalar (array or object), encode its numeric index.
                buildParams(
                    prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
                    v,
                    add
                );
            }
        } );
    } else if ( typeof obj === "object" && obj ) {
        // Serialize object item.
        for ( name in obj ) {
            buildParams( prefix + "[" + name + "]", obj[ name ], add );
        }
    } else {
        // Serialize scalar item.
        add( prefix, obj );
    }
}
function toParamStr ( a ) {
    var prefix,
        s = [],
        add = function( key, valueOrFunction ) {
            // If value is a function, invoke it and use its return value
            var value = typeof valueOrFunction === "function" ?
                valueOrFunction() :
                valueOrFunction;
            s[ s.length ] = encodeURIComponent( key ) + "=" +
                encodeURIComponent( value == null ? "" : value );
        };
    if ( a == null ) {
        return "";
    }
    // encode params recursively.
    for ( prefix in a ) {
        buildParams( prefix, a[ prefix ], add );
    }
    // Return the resulting serialization
    return s.join( "&" );
};

function addParamsToUrl(url, params) {
    if (!params) return url;
    const paramsStr = toParamStr(params);
    if (paramsStr) url += url.includes("?") ? "&" + paramsStr : "?" + paramsStr;
    return url;
}

function parseParams(params) {

    const groups = new Map();

    const isArraySyntax = (key) => /\[\]$/.test(key);

    const baseKey = (key) => key.replace(/\[\]$/, '');

    for (const [key, value] of params.entries()) {

        const base = baseKey(key);
        const arraySyntax = isArraySyntax(key);

        if (!groups.has(base)) {
            groups.set(base, {
                values: [],
                hasArraySyntax: false
            });
        }

        const group = groups.get(base);

        group.values.push(value);

        if (arraySyntax) {
            group.hasArraySyntax = true;
        }
    }

    const result = {};

    for (const [key, group] of groups.entries()) {

        const values = group.values;

        const shouldBecomeIndexed =
            group.hasArraySyntax || values.length > 1;

        // q=1
        if (!shouldBecomeIndexed) {
            result[key] = values[0];
            continue;
        }

        // q[0]=...
        values.forEach((value, index) => {
            result[`${key}[${index}]`] = value;
        });
    }

    return result;
}

var nativeHttp = function(url, options:any = {}, attempt = 1) {
    window.lastConnectionTyle = (<any>navigator)?.connection?.type;
    return new Promise((res, rej) => {
        if (options.data) {
            let ct;
            if (options?.headers?.get) {
                ct = (options.headers.get("Content-Type") || "").toLowerCase();
            }
            if (options.data instanceof FormData || ct === "multipart/form-data") {
                options.serializer = "multipart";
            } else if (options.data instanceof ArrayBuffer || ArrayBuffer.isView(options.data) || ct === "application/octet-stream") {
                options.serializer = "raw";
            } else if (ct === "application/x-www-form-urlencoded") {
                options.serializer = "urlencoded";
                try {
                    if (options.data instanceof URLSearchParams) {
                        options.data = parseParams(options.data);
                    } else if (typeof options.data == 'string') {
                        options.data = parseParams(new URLSearchParams(options.data));
                    }
                } catch(e) {
                    options.data = {};
                }
            } else if (typeof options.data == 'string' || ct === "plain/text") {
                options.serializer = "utf8";
            } else {
                options.serializer = "json";
            }
        }
        let headers = {};
        if (options?.headers?.keys) {
            let keys = options.headers.keys();
            keys.forEach(key => headers[key] = options.headers.get(key));
        }
        
        window.cordova.plugin.http.sendRequest(url, {...options, headers}, response => {
            let parsed;
            try {
                parsed = JSON.parse(response.data);
            } catch (e) {
                parsed = response.data;
            }
            res(parsed);
        }, error => {
            let err;
            try {
                err = JSON.parse(error.error);
            } catch (e) {
                err = error.error;
            }
            error.error = err;
            const isNetworkError = error?.status === 0 || 
                    error?.status === -1 || // generic error
                    error?.status === -3 || // host could not be resolved
                    error?.status === -4 || // timeout
                    error?.status === -6 || // not connected
                    error?.status === -8 || // aborted
                    (typeof err === "string" && err.toLowerCase().includes("network connection was lost"));
            if (isNetworkError && attempt < this.httpRetryLimit) {
                setTimeout(() => {
                    nativeHttp(url, options, attempt + 1)
                        .then(res)
                        .catch(rej);
                }, this.httpRetryDelay);
            } else {
                if (!error.url) error.url = url;
                rej(error);
            }
        });
    })
}

export var UtilsHttp = {
    httpRetryLimit: 2,
    httpRetryDelay: 3500,
    useNativeHttp: true,
    
    initHttpUtils: function() {
        this.apiHost = apiHost + "/rest/1/db/collections/";
        this.proxyUrl = apiHost + "/rest/1/proxy/tunnel";
        this.proxyId = this.config.get("Settings.proxyId") || defaultProxy;
        nativeHttp = nativeHttp.bind(this);
    },
    
    prefereNativeHttp: function(options: any = {}) {
        if (!window.cordova?.plugin?.http?.sendRequest || location.host === 'appery.io') {
            return false;
        }
        if (options.skipNativeHttp) {
            return false;
        }
        return this.useNativeHttp;
    },

    setDefaultHttpOptions: function(options: {[key:string]: any}): void {
        if (options && _.isObject(options)) {
            defaultOptions = {...defaultOptions, ...options};
        }
    },

    getDefaultHttpOptions: function(): {[key:string]: any} {
        return {...defaultOptions};
    },

    headers: {
        "Content-Type": "application/json"
    },
    apiHost: "",
    proxyUrl: "",
    proxyId: "",
    cache: {},

    getOptions: function(options, extraOptions: any = {}) {
        if (options.loading) {
            options.loadingStart = true;
            options.loadingEnd = true;
        } else if(options.loading === false) {
            options.loadingStart = false;
            options.loadingEnd = false;
        }
        return {
            ...defaultOptions,
            ...options,
            ...extraOptions
        };
    },

    setHeaders: function(headers?) {
        this.headers = headers;
    },

    setHost: function(host) {
        this.apiHost = host;
    },

    setProxy: function(proxyId) {
        this.proxyId = proxyId;
    },

    getHost: function(): string {
        return this.apiHost;
    },

    getApiUrl: function(url) {
        return (url.startsWith("http://") || url.startsWith("https://")) ? url : this.apiHost + url;
    },
  
    getHeaders: function(options: {headers: any, clearContentType?: boolean, noExtend?: boolean}) {
        let headers = options.noExtend ? {...options.headers} : {...this.headers, ...options.headers};
        if (options.clearContentType) delete headers['Content-Type'];

        return {
            headers: new HttpHeaders(headers)
        };
    },

    addHeaders: function(headers) {
        this.headers = {
            ...this.headers,
            ...headers
        };

        Object.keys(this.headers).forEach(key => this.headers[key] === undefined && delete this.headers[key]);
    },

    post: async function(url, body, options: any = {}) {
        options = this.getOptions(options);

        try {
            if (options.loadingStart) await this.showLoading();
            url = addParamsToUrl(url, options.params);

            let opt = {
                ...(options.responseType !== undefined && {responseType: options.responseType}),
                ...(options.withCredentials !== undefined && {withCredentials: options.withCredentials}),
                ...this.getHeaders(options)
            };
            url = this.getApiUrl(url);
            if (options.useProxy) {
                opt.headers = opt.headers
                                .append("appery-proxy-url", url)
                                .append("appery-rest", this.proxyId);
                url = this.proxyUrl;
            }
            let res: any;
            if (this.prefereNativeHttp(options)) {
                opt.data = body;
                opt.method = "post";
                res = await nativeHttp(url, opt);
            } else {
                res = await this.http.post(url, body, opt).toPromise();
            }
            if (options.loadingEnd) await this.dismissLoading();
            if (options.message) await this.toast(options.message);

            return res;
        } catch (e) {
            await this.errorCatch(e, options);
            return options.returnError ? e : undefined;
        }
    },

    put: async function(url, body, options: any = {}) {
        options = this.getOptions(options);

        try {
            if (options.loadingStart) await this.showLoading();
            url = addParamsToUrl(url, options.params);

            let opt = {
                ...(options.responseType !== undefined && {responseType: options.responseType}),
                ...(options.withCredentials !== undefined && {withCredentials: options.withCredentials}),
                ...this.getHeaders(options)
            };
            url = this.getApiUrl(url);
            if (options.useProxy) {
                opt.headers = opt.headers
                                .append("appery-proxy-url", url)
                                .append("appery-rest", this.proxyId);
                url = this.proxyUrl;
            }
            let res: any;
            if (this.prefereNativeHttp(options)) {
                opt.data = body;
                opt.method = "put";
                res = await nativeHttp(url, opt);
            } else {
                res = await this.http.put(url, body, opt).toPromise();
            }
            if (options.loadingEnd) await this.dismissLoading();
            if (options.message) await this.toast(options.message);

            return res;
        } catch (e) {
            await this.errorCatch(e, options);
            return options.returnError ? e : undefined;
        }
    },

    getCache: function(name) {
        return _.cloneDeep(this.cache[name]);
    },

    setCache: function(name, value) {
        this.cache[name] = _.cloneDeep(value);
    },

    get: async function(url, options: any = {}) {
        try {
            options = this.getOptions(options);

            let cacheName = 'GET: ' + url;

            if (options.cache) {
                let cacheData = this.getCache(cacheName);
                if (cacheData) return cacheData;
            }

            if (options.loadingStart) await this.showLoading();

            url = addParamsToUrl(url, options.params);

            let opt = {
                ...(options.responseType !== undefined && {responseType: options.responseType}),
                ...(options.withCredentials !== undefined && {withCredentials: options.withCredentials}),
                ...this.getHeaders(options)
            };
            url = this.getApiUrl(url);
            if (options.useProxy) {
                opt.headers = opt.headers
                                .append("appery-proxy-url", url)
                                .append("appery-rest", this.proxyId);
                url = this.proxyUrl;
            }
            let res: any;
            if (this.prefereNativeHttp(options)) {
                res = await nativeHttp(url, opt);
            } else {
                res = await this.http.get(url, opt).toPromise();
            }

            if (options.cache || options.saveInCache) {
                this.setCache(cacheName, res);
            }

            if (options.loadingEnd) await this.dismissLoading();
            if (options.message) await this.toast(options.message);

            return res;
        } catch (e) {
            await this.errorCatch(e, options);
            return options.returnError ? e : undefined;
        }
    },

    delete: async function(url, options: any = {}) {
        try {
            options = this.getOptions(options);
            if (options.loadingStart) await this.showLoading();
            url = addParamsToUrl(url, options.params);

            let opt = {
                ...(options.responseType !== undefined && {responseType: options.responseType}),
                ...(options.withCredentials !== undefined && {withCredentials: options.withCredentials}),
                ...this.getHeaders(options)
            };
            url = this.getApiUrl(url);
            if (options.useProxy) {
                opt.headers = opt.headers
                                .append("appery-proxy-url", url)
                                .append("appery-rest", this.proxyId);
                url = this.proxyUrl;
            }
            let res: any;
            if (this.prefereNativeHttp(options)) {
                opt.method = "delete";
                res = await nativeHttp(url, opt);
            } else {
                res = await this.http.delete(url, opt).toPromise();
            }
            if (options.loadingEnd) await this.dismissLoading();
            if (options.message) await this.toast(options.message);

            return res;
        } catch (e) {
            await this.errorCatch(e, options);
            return options.returnError ? e : undefined;
        }
    },

    getFileBase64Data: function(base64Data) {
        return this.isDataURL(base64Data) ? this.dataURLtoBase64(base64Data) : base64Data
    },

    saveFile: function(data, fileName) {
        if (data.length || data.size) {
            const blob = data instanceof Blob ? new Blob([data]) : this.convertBase64ToBlob(data);
            const a = document.createElement('a');
            const url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } else {
            console.log('No data');
        }
    },

    saveTextFile: function(text, fileName) {
        if (text.length) {
            const a = document.createElement('a');
            a.href = 'data:text/plain;charset=utf-8, ' + encodeURIComponent(text);
            a.download = fileName;
            a.click();
            a.remove();
        } else {
            console.log('No data');
        }
    },
    
    sc: async function(scriptName, body = {}, options: any = {}) {
        if (!scriptName.includes('.')) scriptName = "Settings." + scriptName;
        let opt = {...options, headers: {...this.db.headers, ...options.headers}};
        return await this.post(`${apiHost}/rest/1/code/${this.config.get(scriptName)}/exec`, body, opt);
    },

};

export interface UtilsHttpInterface {
    /** internal */
    getCache(name: string): any;
    setCache(name: string, value): any;
    getFileBase64Data(base64Data: string): string;
    getOptions(options: {[key:string]: any}, extraOptions?: {[key:string]: any});
    proxyUrl: string;
    proxyId: string;
    /** common */
    setDefaultHttpOptions(options: {[key:string]: any}): void;
    getDefaultHttpOptions(): {[key:string]: any};
    setHeaders(headers?: {[key:string]: string}): void;
    setHost(host: string): void;
    getHost(): string;
    setProxy(proxyId: string): void;
    getApiUrl(url: string): string;
    getHeaders(options?: {headers: any, clearContentType?: boolean, noExtend?: boolean}): {headers: HttpHeaders};
    addHeaders(headers: {[key:string]: string}): void;
    post(url: string, body, options?): Promise<any>;
    put(url: string, body, options?): Promise<any>;
    get(url: string, options?): Promise<any>;
    delete(url: string, options?): Promise<any>;
    saveFile(data: Blob|string, fileName: string): void;
    saveTextFile(text: string, fileName: string): void;
    sc(scriptName: string, body?, options?): Promise<any>;
};
