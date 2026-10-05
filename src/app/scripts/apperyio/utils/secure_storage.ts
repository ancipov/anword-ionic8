import * as CryptoJS from "crypto-js";

const WARNING = "WARNING! Secure Storage only works in native applications (apk/aab, ipa). It is not possible to implement Secure Storage in the Web version, so a placeholder is used exclusively for testing the application. Do not use Secure Storage in the production version of the Web application.";
let warningWasShown = true;
let initError = false;
let useWebImpl = false;

export const UtilsSecureStorage: UtilsSecureStorageInterface = {
  async ssGet(key: string): Promise<any | null> {
    let webImpl = ()=> {
      showWarning(this);
      const v = localStorage["secure_" + key];
      if (!v) return v;
      let value;
      try {
        const bytes = CryptoJS.AES.decrypt(localStorage["secure_" + key], key) ?? null;
        value = bytes && bytes.toString(CryptoJS.enc.Utf8);

        const parsedValue = JSON.parse(value);
        return parsedValue;
      } catch(e) {
        return value;
      }
    };
    if (this.isMobile()) {
      await this.platform.ready();
      await initCordovaSecureStorage();
    }
    if (this.isMobile() && !initError && !useWebImpl) {
      return new Promise((resolve, reject) => {
        (<any>window).apperySecureStorage.get(
          (value: string) => {
            try {
              const parsedValue = JSON.parse(value);
              this.ngZone.run(() => resolve(parsedValue));
            } catch(e) {
              this.ngZone.run(() => {
                resolve(webImpl());
              });
            }
          },
          (error) => {
            this.ngZone.run(() => resolve(undefined));
          },
          key
        );
      });
    } else {
      return webImpl();
    }
  },

  async ssSet(key: string, value: any): Promise<void> {
    let webImpl = () => {
      showWarning(this);
      localStorage["secure_" + key] = CryptoJS.AES.encrypt(value, key).toString();
    };
    value = JSON.stringify(value);
    if (this.isMobile()) {
      await this.platform.ready();
      await initCordovaSecureStorage();
    }
    if (this.isMobile() && !initError && !useWebImpl) {
  
      return new Promise((resolve, reject) => {
        (<any>window).apperySecureStorage.set(
          () => {
            this.ngZone.run(() => resolve());
          },
          (error) => {
            this.ngZone.run(() => {
              webImpl();
              resolve();
            });
          },
          key,
          value
        );
      });
    } else {
      webImpl();
    }
  },

  async ssRemove(key: string): Promise<void> {
    let webImpl = () => {
      showWarning(this);
      localStorage.removeItem("secure_" + key);
    };
    if (this.isMobile()) {
      await this.platform.ready();
      await initCordovaSecureStorage();
    }
    if (this.isMobile() && !initError && !useWebImpl) {
  
      return new Promise((resolve, reject) => {
        (<any>window).apperySecureStorage.set(
          () => {
            (<any>window).apperySecureStorage.remove(
              () => {
                this.ngZone.run(() => {
                  resolve();
              });
              },
              (error) => {
                this.ngZone.run(() => {
                  webImpl();
                  resolve();
                });
              },
              key
            );
          },
          (error) => {
            this.ngZone.run(() => {
              webImpl();
              resolve();
            });
          },
          key,
          ""
        );
      });
    } else {
      webImpl();
    }
  },
}

export interface UtilsSecureStorageInterface {
  ssGet(key: string): Promise<any | null>;
  ssSet(key: string, value: any): Promise<void>;
  ssRemove(key: string): Promise<void>;
}

async function initCordovaSecureStorage(): Promise<void> {
  if ((<any>window).apperySecureStorage) return;
  try {
    const secureStorage = await createCordovaSecureStorage("appery");
    (<any>window).apperySecureStorage = secureStorage;
    if (!secureStorage) {
      initError = true;
    } else {
      const value = Math.random().toString(), key = "__aio_test_init_value__";
      const res = await new Promise((resolve, reject) => {
        (<any>window).apperySecureStorage.set(
          () => {
            (<any>window).apperySecureStorage.get(
              (val: string) => {  
                resolve(value === val);
              },
              (error) => {
                resolve(false);
              },
              key
            );
          },
          (error) => {
            resolve(false);
          },
          key, value);
        });
      if (!res) {
        useWebImpl = true;
      }
    }
  } catch (e) {
    console.log(e);
    initError = true;
  }
}

function createCordovaSecureStorage(storageKey: string) {
  return new Promise((resolve, reject) => {
    const secureStorage = new (<any>window).cordova.plugins.SecureStorage(
      () => resolve(secureStorage),
      (error) => resolve(undefined),
      storageKey
    );
  });
}

function showWarning($a) {
  if (!warningWasShown) {
    if ($a.isBrowser()) {
      console.warn(WARNING);
    }
    warningWasShown = true;
  }
}
