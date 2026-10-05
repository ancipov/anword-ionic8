import { Storage } from '@ionic/storage-angular';
import { Subject } from 'rxjs';
import { _aioDefStorageValues } from '../models';
import _ from "lodash";

import {
    Injectable
} from '@angular/core';

@Injectable()
export class ApperyioDataHelperService {
    
    constructor(private storage: Storage) {
    }

    private _variables: {[name:string]: any} = {};
    private initialized = false;
    private initStarted = false;
    private initializedSubject = new Subject();
    
    public async init(context) {
        if (this.initStarted) return;
        this.initStarted = true;

        let keys;

        const variables = _aioDefStorageValues.variables;
        keys = Object.keys(variables);
        keys.forEach((key) => {
            this.setVariable(key, _.cloneDeep(variables[key]));
        });

        const functions = _aioDefStorageValues.functions;
        keys = Object.keys(functions);
        keys.forEach((key) => {
            this.setVariable(key, functions[key].bind(context));
        });

        const storages = _aioDefStorageValues.storages;
        keys = Object.keys(storages);
        const finishInit = () => {
            this.initialized = true;
            this.initializedSubject.next(undefined);
            this.initializedSubject.complete();
        }

        this.storage = await this.storage.create();

        if (keys.length) {
            this.storage.keys()
                .then(storageKeys => {
                    let setPromises = [];
                    for (let i = 0; i < keys.length; i++) {
                        const key = keys[i];
                        if (storageKeys.indexOf(key) === -1) {
                            setPromises.push(this.setStorage(key, storages[key]));
                        }
                    }
                    Promise.all(setPromises)
                        .then(() => {
                            finishInit();
                        })
                        .catch(() => {
                            finishInit();
                        });
                })
                .catch(() => {
                    finishInit();
                });
        } else {
            finishInit();
        }
    }

    setVariable(varName: string, value: any) {
        this._variables[varName] = value;
    }

    getVariable(varName: string): any {
        return this._variables[varName];
    }

    setStorage(varName: string, value: any): Promise<any> {
        return this.storage.set(varName, value);
    }
    
    private _getStorage(varName: string): Promise<any> {
        return this.storage.get(varName);
    }

    getStorage(varName: string): Promise<any> {
        if (this.initialized) {
            return this._getStorage(varName);
        } else {
            return new Promise((res) => {
                this.initializedSubject.subscribe(
                    () => {
                        this.getStorage(varName).then(val => res(val));
                    }
                );
            })
        }
    }
    
    removeStorage(varName: string): Promise<any> {
        return this.storage.remove(varName);
    }

    clearStorage(): Promise<any> {
        return this.storage.clear();
    }

    getStorageKeys(): Promise<any> {
        return this.storage.keys();
    }

};
