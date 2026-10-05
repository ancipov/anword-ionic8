import {
    Injectable
} from '@angular/core';

function isColorLight(hex) {
    hex = hex.replace('#', '');

    if (hex.length === 8) {
        hex = hex.substring(2);
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);

    return brightness > 128;
}

@Injectable()
export class ApperyioThemeHelperService {

    getCurrent(): string {
        return window.document.body.dataset.themeName || "";
    }

    set(themeName: string = "", setStatusbarColor: string|boolean = false) {
        let currTheme = window.document.body.dataset.themeName || "";
        currTheme && window.document.body.classList.remove(currTheme);

        window.document.body.dataset.themeName = themeName;
        themeName && window.document.body.classList.add(themeName);

        if (setStatusbarColor) {
            let color;
            if (setStatusbarColor === true) {
                const styles = window.getComputedStyle(document.body);
                color = styles.getPropertyValue('--background') ||
                    styles.getPropertyValue('--ion-toolbar-background') ||
                    styles.getPropertyValue('--ion-background-color') ||
                    '#ffffff';
            } else {
                color = setStatusbarColor;
            }
            const isLight = isColorLight(color);

            if (window.AndroidEdgeToEdge) {
                window.AndroidEdgeToEdge.enable({
                    lightStatusBar: isLight,
                    lightNavigationBar: isLight,
                    backgroundColor: color,
                });

            } else {
                if (window.StatusBar) {
                    window.StatusBar.backgroundColorByHexString?.(color);
                    if (isLight) {
                        window.StatusBar.styleDefault?.();
                    } else {
                        window.StatusBar.styleLightContent?.();
                    }
                }
                if (window.NavigationBar) {
                    window.NavigationBar.backgroundColorByHexString?.(color, isLight);
                }
            }
        }
    }
};
