import {
    Directive,
    HostListener,
    Host,
    Optional,
    ElementRef,
    Renderer2
} from '@angular/core';
import {
    Platform,
    IonTabs
} from '@ionic/angular';

@Directive({
    standalone: false,
    selector: '[aioAnimatedTabs]' // Attribute selector
})
export default class AioAnimatedTabsDirective {

    private tabBorderEl!: HTMLElement;
    private activeItem;
    private sub;
    private attempts = 0;
    private firstLoad = true;

    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
        if (!event.isTrusted) return;
        this.el.nativeElement?.style.setProperty("--timeOut", "none");
        setTimeout(() => this.moveBorderToTab(), 50);
        setTimeout(() => this.el.nativeElement?.style.removeProperty("--timeOut"), 1000);
    }

    constructor(private platform: Platform, private el: ElementRef, private renderer: Renderer2, @Host() @Optional() private ionTabs ? : IonTabs) {
        this.onKeyboardWillHide = this.onKeyboardWillHide.bind(this);
    }

    ngOnInit() {
        this.el.nativeElement?.style.setProperty("--timeOut", "none");
        if (this.el.nativeElement) {
            const borderEl = this.renderer.createElement('div');
            this.renderer.addClass(borderEl, 'button_top_border');
            if (this.el.nativeElement.firstChild) {
                this.renderer.insertBefore(this.el.nativeElement, borderEl, this.el.nativeElement.firstChild);
            } else {
                this.renderer.appendChild(this.el.nativeElement, borderEl);
            }
            this.tabBorderEl = borderEl;
        }
        if (this.isIOS()) {
            window.addEventListener('keyboardWillHide', this.onKeyboardWillHide);
        }
    }
    
    private onKeyboardWillHide() {
        this.el.nativeElement?.style.setProperty("display", "none");
        setTimeout(() => this.el.nativeElement?.style.setProperty("display", "flex"), 100);
    }
    private isIOS() {
        return this.platform.is('ios') && (this.platform.is('cordova') || (location.href.includes("hot_reload=true") || location.href.includes("preview_build=true")));
    }

    async ngAfterViewInit() {
        this.sub = this.ionTabs?.ionTabsDidChange.subscribe((ev: any) => {
            this.attempts = 0;
            this.activeItem = ev.tab;
            this.moveWithTimeout();
        });
    }

    moveWithTimeout() {
        this.attempts++;
        if (this.attempts < 25) {
            setTimeout(() => {
                this.moveBorderToTab();
            }, 50);
        }
    }

    private moveBorderToTab() {
        if (!this.activeItem) return;
        const btn: HTMLElement = this.el.nativeElement.querySelector(`ion-tab-button[tab="${this.activeItem}"]`) as HTMLElement;
        if (!btn) return;
        // Move border element to the active tab
        const rect = btn.getBoundingClientRect();
        if (rect.width === 0) {
            this.moveWithTimeout();
            return;
        }
        this.attempts = 0;
        const parentRect = this.el.nativeElement?.getBoundingClientRect();
        let left = rect.left - parentRect.left + (rect.width - this.tabBorderEl.getBoundingClientRect().width) / 2;
        this.renderer.setStyle(this.tabBorderEl, 'transform', `translateX(${left}px)`);
        if (this.firstLoad) {
            this.firstLoad = false;
            setTimeout(() => this.el.nativeElement?.style.removeProperty("--timeOut"), 100);
        }
    }

    ngOnDestroy() {
        this.sub?.unsubscribe();
        if (this.isIOS()) {
            window.removeEventListener('keyboardWillHide', this.onKeyboardWillHide);
        }
        this.ionTabs = null;
        this.tabBorderEl.remove();
        this.tabBorderEl = null;
    }
}
