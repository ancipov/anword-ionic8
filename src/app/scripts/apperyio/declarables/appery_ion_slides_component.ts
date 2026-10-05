import {
    Component,
    Input,
    Output,
    EventEmitter,
    ElementRef,
    AfterViewInit,
    OnDestroy,
    OnChanges,
    SimpleChanges,
    ViewChild,
    ContentChildren,
    QueryList,
    NgZone,
    ChangeDetectionStrategy,
    inject,
    OnInit,
    HostBinding
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Platform } from '@ionic/angular';

import { Swiper } from 'swiper';
import type {
    SwiperOptions,
    PaginationOptions,
    ScrollbarOptions,
    NavigationOptions,
    SwiperModule,
    SwiperEvents
} from 'swiper/types';
import { Navigation, Pagination, Scrollbar, Autoplay } from 'swiper/modules';

@Component({
    selector: 'ion-slide',
    template: `<ng-content></ng-content>`,
    styles: [`
    :host {
      display: block;
      flex-shrink: 0;
      width: 100%;
      height: 100%;
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IonSlideComponent {
    @HostBinding('class.swiper-slide') swiperSlideClass = true;
    constructor() { }
}

@Component({
    selector: 'ion-slides',
    template: `
    <div #swiperContainer class="swiper-container" [class.swiper-container-rtl]="dir === 'rtl'">
      <div class="swiper-wrapper">
        <ng-content></ng-content>
      </div>
      <div *ngIf="pager" class="swiper-pagination"></div>
      <div *ngIf="scrollbar" class="swiper-scrollbar"></div>
      <div *ngIf="options?.navigation && options.navigation !== false" class="swiper-button-prev"></div>
      <div *ngIf="options?.navigation && options.navigation !== false" class="swiper-button-next"></div>
    </div>
  `,
    styles: [`
    @import 'swiper/swiper-bundle.css';

    :host {
      display: block;
      width: 100%;
      position: relative;
      overflow: hidden;
    }

    .swiper-container {
      width: 100%;
      height: 100%;
    }

    /* Ionic styling */
    :host .swiper-pagination {
      bottom: var(--ion-slides-pager-bottom, 8px);
      /* left: 50%; */
      /* transform: translateX(-50%); */
      /* width: auto; */
      --swiper-pagination-color: var(--ion-color-primary, #3880ff);
      --swiper-pagination-bullet-inactive-color: var(--ion-color-medium, #92949c);
      --swiper-pagination-bullet-inactive-opacity: 0.3;
      --swiper-pagination-bullet-size: 8px;
      --swiper-pagination-bullet-horizontal-gap: 4px;
    }
    :host(.swiper-pagination-bullets-dynamic) .swiper-pagination {
        /* Override dynamic bullet styles if needed */
        left: 50%;
        transform: translateX(-50%);
        width: auto;
    }


    :host .swiper-scrollbar {
      bottom: var(--ion-slides-scrollbar-bottom, 4px);
      left: var(--ion-slides-scrollbar-left, 4px);
      right: var(--ion-slides-scrollbar-right, 4px);
      width: auto;
      height: var(--ion-slides-scrollbar-height, 3px);
      --swiper-scrollbar-bg-color: var(--ion-color-light-shade, rgba(218, 218, 218, 0.5));
      --swiper-scrollbar-drag-bg-color: var(--ion-color-dark, #222428);
      --swiper-scrollbar-size: var(--ion-slides-scrollbar-height, 3px);
    }
    :host(.scrollbar-visible) .swiper-scrollbar {
      opacity: 1;
    }

    :host .swiper-button-prev,
    :host .swiper-button-next {
        --swiper-navigation-color: var(--ion-color-primary, #3880ff);
        --swiper-navigation-size: 24px;
        top: var(--ion-slides-navigation-top, 50%);
    }
    :host .swiper-button-prev {
       left: var(--ion-slides-navigation-side-offset, 8px);
    }
    :host .swiper-button-next {
        right: var(--ion-slides-navigation-side-offset, 8px);
    }
    /* --- Ionic styling end --- */
  `],
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IonSlidesComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
    @ViewChild('swiperContainer', { static: true }) swiperContainer!: ElementRef<HTMLDivElement>;
    @ContentChildren(IonSlideComponent) slides!: QueryList<IonSlideComponent>;

    swiperInstance: Swiper | null = null;
    private platform = inject(Platform);
    private ngZone = inject(NgZone);

    // --- Inputs (Properties) ---
    @Input() options?: SwiperOptions;
    @Input() pager: boolean | PaginationOptions = false;
    @Input() scrollbar: boolean | ScrollbarOptions = false;
    @Input() mode: 'ios' | 'md' = 'md';

    @Input() navigation: boolean | NavigationOptions = false;
    @Input() dir: 'ltr' | 'rtl' = 'ltr';
    @Input() initialSlide: number = 0;
    @Input() disabled: boolean = false;

    // --- Outputs (Events) ---
    @Output() ionSlidesDidLoad = new EventEmitter<IonSlidesComponent>();
    @Output() ionSlideWillChange = new EventEmitter<IonSlidesComponent>();
    @Output() ionSlideDidChange = new EventEmitter<IonSlidesComponent>();
    @Output() ionSlideNextStart = new EventEmitter<IonSlidesComponent>();
    @Output() ionSlidePrevStart = new EventEmitter<IonSlidesComponent>();
    @Output() ionSlideNextEnd = new EventEmitter<IonSlidesComponent>();
    @Output() ionSlidePrevEnd = new EventEmitter<IonSlidesComponent>();
    @Output() ionSlideTouchStart = new EventEmitter<{ swiper: Swiper, event: Event }>();
    @Output() ionSlideTouchEnd = new EventEmitter<{ swiper: Swiper, event: Event }>();
    @Output() ionSlideDrag = new EventEmitter<IonSlidesComponent>();
    @Output() ionSlideReachStart = new EventEmitter<IonSlidesComponent>();
    @Output() ionSlideReachEnd = new EventEmitter<IonSlidesComponent>();
    @Output() ionSlideAutoplayStart = new EventEmitter<IonSlidesComponent>();
    @Output() ionSlideAutoplayStop = new EventEmitter<IonSlidesComponent>();
    @Output() ionSliderDrag = new EventEmitter<IonSlidesComponent>();
    @Output() ionSlidesProgress = new EventEmitter<{ swiper: Swiper, progress: number }>();
    @Output() ionSlideTransitionStart = new EventEmitter<IonSlidesComponent>();
    @Output() ionSlideTransitionEnd = new EventEmitter<IonSlidesComponent>();
    @Output() ionSlideTap = new EventEmitter<IonSlidesComponent>();
    @Output() ionSlideDoubleTap = new EventEmitter<IonSlidesComponent>();

    @HostBinding('class.ios') get isIos() { return this.mode === 'ios'; }
    @HostBinding('class.md') get isMd() { return this.mode === 'md'; }
    @HostBinding('class.scrollbar-visible') get isScrollbarVisible() { return !!this.scrollbar; }

    private isInitialized = false;
    private mutationObserver: MutationObserver | null = null;

    constructor() {
        this.mode = this.platform.is('ios') ? 'ios' : 'md';
    }

    ngOnInit() {
        if (!this.dir) {
            const docDir = document.documentElement.dir || window.getComputedStyle(document.documentElement).direction;
            this.dir = docDir === 'rtl' ? 'rtl' : 'ltr';
        }
        this.swiperContainer.nativeElement.dir = this.dir;
    }


    ngAfterViewInit(): void {
        // A small delay might help if slides are added dynamically right after init.
        this.ngZone.runOutsideAngular(() => {
            setTimeout(() => this.initSwiper(), 10);
        });
        this.observeDOMChanges();
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Reinitialization or updating Swiper when critical @Input values change
        if (this.swiperInstance && !this.swiperInstance.destroyed) {
            const needsReInit = ['options', 'dir', 'navigation', 'initialSlide'].some(prop => changes[prop] && !changes[prop].firstChange);
            const needsUpdate = ['pager', 'scrollbar', 'disabled'].some(prop => changes[prop] && !changes[prop].firstChange);

            if (needsReInit) {
                // Wrap the logic in setTimeout to ensure proper DOM synchronization (essential for dynamic dir changes)
                setTimeout(() => {
                    this.destroySwiper();
                    this.initSwiper();
                }, 10);

            } else if (needsUpdate) {
                this.updateSwiperConfig();
                if (changes['disabled']) {
                    this.lockSwipes(this.disabled);
                }
            }
        } else if (!this.isInitialized && this.swiperContainer?.nativeElement) {
            // Retry initialization if it fails in AfterViewInit.
            setTimeout(() => this.initSwiper(), 10);
        }
    }

    ngOnDestroy(): void {
        this.destroySwiper();
        this.disconnectObserver();
    }

    private initSwiper(): void {
        if (this.isInitialized || !this.swiperContainer?.nativeElement) {
            return;
        }

        this.swiperContainer.nativeElement.dir = this.dir;

        this.ngZone.runOutsideAngular(() => {
            const finalOptions = this.buildSwiperOptions();
            const uniqueModules = this.getUniqueModules(finalOptions);

            try {
                this.swiperInstance = new Swiper(this.swiperContainer.nativeElement, {
                    ...finalOptions,
                    modules: uniqueModules,
                });

                this.swiperInstance.update();

                this.setupEventListeners();
                this.isInitialized = true;
                this.lockSwipes(this.disabled);
                this.ngZone.run(() => {
                    this.ionSlidesDidLoad.emit(this);
                });
            } catch (error) {
                this.isInitialized = false;
            }
        });
    }

    private getUniqueModules(finalOptions: SwiperOptions): SwiperModule[] {
        const modulesToRegister: SwiperModule[] = [];
        if (!!finalOptions.navigation) modulesToRegister.push(Navigation);
        if (!!finalOptions.pagination) modulesToRegister.push(Pagination);
        if (!!finalOptions.scrollbar) modulesToRegister.push(Scrollbar);
        if (!!finalOptions.autoplay) modulesToRegister.push(Autoplay);

        if (finalOptions.modules) {
            modulesToRegister.push(...finalOptions.modules);
        }
        return [...new Set(modulesToRegister.filter(m => m))];
    }

    private buildSwiperOptions(): SwiperOptions {
        const swiperDefaults: SwiperOptions = {
            initialSlide: this.initialSlide,
            direction: 'horizontal',
            slidesPerView: 1,
            spaceBetween: 0,
            watchOverflow: true,
            grabCursor: true,
            observer: true,
            observeParents: true,
            on: {},
            touchEventsTarget: 'container',
        };

        let builtOptions: SwiperOptions = { ...swiperDefaults };

        const navConfig = this.buildModuleConfigObject(
            this.navigation || this.options?.navigation,
            { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
        );
        const pgnConfig = this.buildModuleConfigObject(
            this.pager,
            { el: '.swiper-pagination', type: 'bullets', clickable: true }
        );
        const scrollConfig = this.buildModuleConfigObject(
            this.scrollbar,
            { el: '.swiper-scrollbar', draggable: true, hide: false }
        );

        if (navConfig) builtOptions.navigation = navConfig;
        if (pgnConfig) builtOptions.pagination = pgnConfig;
        if (scrollConfig) builtOptions.scrollbar = scrollConfig;

        const userOptions = this.options || {};
        builtOptions = {
            ...builtOptions,
            ...userOptions,

            navigation: userOptions.navigation !== undefined
                ? (typeof userOptions.navigation === 'object'
                    ? userOptions.navigation
                    : (userOptions.navigation ? builtOptions.navigation : false))
                : builtOptions.navigation,

            pagination: userOptions.pagination !== undefined
                ? (typeof userOptions.pagination === 'object'
                    ? userOptions.pagination
                    : (userOptions.pagination ? builtOptions.pagination : false))
                : builtOptions.pagination,

            scrollbar: userOptions.scrollbar !== undefined
                ? (typeof userOptions.scrollbar === 'object'
                    ? userOptions.scrollbar
                    : (userOptions.scrollbar ? builtOptions.scrollbar : false))
                : builtOptions.scrollbar,

            on: {
                ...(builtOptions.on || {}),
                ...(userOptions.on || {})
            }
        };

        delete builtOptions['mode'];

        if (builtOptions.loop && builtOptions.scrollbar) {
            // console.warn("Swiper loop mode might conflict with scrollbar visibility/behavior.");
        }

        return builtOptions;
    }

    private buildModuleConfigObject<T>(input: boolean | string | T | undefined, defaultOptions: T): T | false {
        if (input === true || input === "true") {
            return defaultOptions;
        } else if (typeof input === 'object' && input !== null) {
            return { ...defaultOptions, ...input };
        } else {
            return {} as any;
        }
    }

    private setupEventListeners(): void {
        if (!this.swiperInstance) return;
        const swiper = this.swiperInstance;

        swiper.on('slideChangeTransitionStart', (sw) => this.ngZone.run(() => this.ionSlideWillChange.emit(this)));
        swiper.on('slideChangeTransitionEnd', (sw) => this.ngZone.run(() => this.ionSlideDidChange.emit(this)));
        swiper.on('slideNextTransitionStart', (sw) => this.ngZone.run(() => this.ionSlideNextStart.emit(this)));
        swiper.on('slidePrevTransitionStart', (sw) => this.ngZone.run(() => this.ionSlidePrevStart.emit(this)));
        swiper.on('slideNextTransitionEnd', (sw) => this.ngZone.run(() => this.ionSlideNextEnd.emit(this)));
        swiper.on('slidePrevTransitionEnd', (sw) => this.ngZone.run(() => this.ionSlidePrevEnd.emit(this)));
        swiper.on('touchStart', (sw, event) => this.ngZone.run(() => this.ionSlideTouchStart.emit({ swiper: sw, event })));
        swiper.on('touchEnd', (sw, event) => this.ngZone.run(() => this.ionSlideTouchEnd.emit({ swiper: sw, event })));
        swiper.on('sliderMove', (sw, event) => this.ngZone.run(() => {
            this.ionSlideDrag.emit(this);
            this.ionSliderDrag.emit(this);
        }));
        swiper.on('reachBeginning', (sw) => this.ngZone.run(() => this.ionSlideReachStart.emit(this)));
        swiper.on('reachEnd', (sw) => this.ngZone.run(() => this.ionSlideReachEnd.emit(this)));
        swiper.on('autoplayStart', (sw) => this.ngZone.run(() => this.ionSlideAutoplayStart.emit(this)));
        swiper.on('autoplayStop', (sw) => this.ngZone.run(() => this.ionSlideAutoplayStop.emit(this)));
        swiper.on('progress', (sw, progress) => this.ngZone.run(() => this.ionSlidesProgress.emit({ swiper: sw, progress })));
        swiper.on('transitionStart', (sw) => this.ngZone.run(() => this.ionSlideTransitionStart.emit(this)));
        swiper.on('transitionEnd', (sw) => this.ngZone.run(() => this.ionSlideTransitionEnd.emit(this)));

        swiper.on('tap', (sw) => this.ngZone.run(() => this.ionSlideTap.emit(this)));
        swiper.on('doubleTap', (sw) => this.ngZone.run(() => this.ionSlideDoubleTap.emit(this)));

        if (this.options?.on) {
            Object.keys(this.options.on).forEach(eventName => {
                const handler = this.options!.on![eventName as keyof SwiperEvents];
                if (typeof handler === 'function') {
                    swiper.on(eventName as any, (...args: any[]) => this.ngZone.run(() => handler.apply(null, args)));
                }
            });
        }
    }

    private observeDOMChanges(): void {
        if (!this.swiperContainer || typeof MutationObserver === 'undefined') {
            return;
        }
        const wrapper = this.swiperContainer.nativeElement.querySelector<HTMLElement>('.swiper-wrapper');
        if (!wrapper) return;

        this.mutationObserver = new MutationObserver((mutations) => {
            const slideChanged = mutations.some(mutation => mutation.type === 'childList');
            if (slideChanged && this.swiperInstance && !this.swiperInstance.destroyed) {
                this.ngZone.runOutsideAngular(() => {
                    // Let Swiper auto-update via observer: true before triggering manual refresh
                    requestAnimationFrame(() => {
                        if (this.swiperInstance && !this.swiperInstance.destroyed && !this.swiperInstance.params.observer) {
                            // Fall back to manual updates only when observer is disabled
                            this.swiperInstance.update();
                            // console.log('Swiper updated manually due to DOM changes');
                        }
                    });
                });
            }
        });
        this.mutationObserver.observe(wrapper, { childList: true });
    }

    private disconnectObserver(): void {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }
    }

    // Updates only module configurations (pagination, scrollbar, etc.)
    private updateSwiperConfig(): void {
        if (!this.swiperInstance || this.swiperInstance.destroyed) return;

        this.ngZone.runOutsideAngular(() => {
            const swiper = this.swiperInstance!;
            const currentParams = swiper.params;
            const newOptions = this.buildSwiperOptions();

            // Update pagination
            const newPagination = newOptions.pagination;
            if (newPagination && !currentParams.pagination) {
                currentParams.pagination = newPagination;
                swiper.pagination?.init(); swiper.pagination?.render(); swiper.pagination?.update();
            } else if (newPagination && currentParams.pagination) {
                Object.assign(currentParams.pagination, newPagination);
                swiper.pagination?.update();
            } else if (!newPagination && currentParams.pagination) {
                swiper.pagination?.destroy();
                currentParams.pagination = false;
            }

            // Scrollbar update
            const newScrollbar = newOptions.scrollbar;
            if (newScrollbar && !currentParams.scrollbar) {
                currentParams.scrollbar = newScrollbar;
                swiper.scrollbar?.init(); swiper.scrollbar?.updateSize();
            } else if (newScrollbar && currentParams.scrollbar) {
                Object.assign(currentParams.scrollbar, newScrollbar);
                swiper.scrollbar?.updateSize();
            } else if (!newScrollbar && currentParams.scrollbar) {
                swiper.scrollbar?.destroy();
                currentParams.scrollbar = false;
            }

            // Navigation update
            const newNavigation = newOptions.navigation;
            if (newNavigation && !currentParams.navigation) {
                currentParams.navigation = newNavigation;
                swiper.navigation?.init(); swiper.navigation?.update();
            } else if (newNavigation && currentParams.navigation) {
                Object.assign(currentParams.navigation, newNavigation);
                swiper.navigation?.update();
            } else if (!newNavigation && currentParams.navigation) {
                swiper.navigation?.destroy();
                currentParams.navigation = false;
            }

            // Manually update Swiper if observer is disabled
            if (!swiper.params.observer) {
                swiper.update();
            }
        });
    }


    private destroySwiper(): void {
        this.disconnectObserver(); // Stop observation before destruction
        if (this.swiperInstance && !this.swiperInstance.destroyed) {
            this.ngZone.runOutsideAngular(() => {
                try {
                    this.swiperInstance?.destroy(true, true);
                } catch (e) {
                    console.warn("Error destroying swiper instance:", e);
                }
                this.swiperInstance = null;
                this.isInitialized = false;
            });
        } else {
            this.swiperInstance = null; // Guarantee object reference is nullified
            this.isInitialized = false;
        }
    }

    // --- Public Methods (API) ---

    update(): Promise<void> {
        return new Promise<void>(resolve => {
            if (this.swiperInstance && !this.swiperInstance.destroyed) {
                this.ngZone.runOutsideAngular(() => {
                    this.swiperInstance?.update();
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    updateAutoHeight(speed = 100): Promise<void> {
        return new Promise<void>(resolve => {
            if (this.swiperInstance && !this.swiperInstance.destroyed) {
                this.ngZone.runOutsideAngular(() => {
                    this.swiperInstance?.updateAutoHeight(speed);
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    slideTo(index: number, speed?: number, runCallbacks?: boolean): Promise<void> {
        return new Promise<void>(resolve => {
            if (this.swiperInstance && !this.swiperInstance.destroyed) {
                this.ngZone.runOutsideAngular(() => {
                    this.swiperInstance?.slideTo(index, speed, runCallbacks);
                    // Swiper has no Promise API — resolve immediately or with delay
                    // setTimeout(resolve, speed ?? this.swiperInstance?.params.speed ?? 300);
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    slideNext(speed?: number, runCallbacks?: boolean): Promise<void> {
        return new Promise<void>(resolve => {
            if (this.swiperInstance && !this.swiperInstance.destroyed) {
                this.ngZone.runOutsideAngular(() => {
                    this.swiperInstance?.slideNext(speed, runCallbacks);
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    slidePrev(speed?: number, runCallbacks?: boolean): Promise<void> {
        return new Promise<void>(resolve => {
            if (this.swiperInstance && !this.swiperInstance.destroyed) {
                this.ngZone.runOutsideAngular(() => {
                    this.swiperInstance?.slidePrev(speed, runCallbacks);
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    startAutoplay(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            if (this.swiperInstance?.autoplay && !this.swiperInstance.destroyed) {
                this.ngZone.runOutsideAngular(() => {
                    const started = this.swiperInstance?.autoplay?.start();
                    resolve(!!started);
                });
            } else {
                resolve(false);
            }
        });
    }

    stopAutoplay(): Promise<void> {
        return new Promise<void>(resolve => {
            if (this.swiperInstance?.autoplay && !this.swiperInstance.destroyed) {
                this.ngZone.runOutsideAngular(() => {
                    this.swiperInstance?.autoplay?.stop();
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    lockSwipes(shouldLock: boolean): Promise<void> {
        return new Promise<void>(resolve => {
            if (this.swiperInstance && !this.swiperInstance.destroyed) {
                this.ngZone.runOutsideAngular(() => {
                    if (shouldLock) {
                        this.swiperInstance?.disable();
                    } else {
                        this.swiperInstance?.enable();
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    lockSwipeToNext(shouldLock: boolean): Promise<void> {
        return new Promise<void>(resolve => {
            if (this.swiperInstance && !this.swiperInstance.destroyed) {
                this.ngZone.runOutsideAngular(() => {
                    if (this.swiperInstance) { // Check for TypeScript
                        this.swiperInstance.allowSlideNext = !shouldLock;
                        // Swiper handles internal state updates automatically
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    lockSwipeToPrev(shouldLock: boolean): Promise<void> {
        return new Promise<void>(resolve => {
            if (this.swiperInstance && !this.swiperInstance.destroyed) {
                this.ngZone.runOutsideAngular(() => {
                    if (this.swiperInstance) { // Check for TypeScript
                        this.swiperInstance.allowSlidePrev = !shouldLock;
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    isBeginning(): Promise<boolean> {
        return Promise.resolve(this.swiperInstance?.isBeginning ?? true);
    }

    isEnd(): Promise<boolean> {
        return Promise.resolve(this.swiperInstance?.isEnd ?? false);
    }

    getActiveIndex(): Promise<number> {
        return Promise.resolve(this.swiperInstance?.activeIndex ?? 0);
    }

    getPreviousIndex(): Promise<number> {
        return Promise.resolve(this.swiperInstance?.previousIndex ?? 0);
    }

    length(): Promise<number> {
        // Return the actual number of slides (ion-slide elements)
        return Promise.resolve(this.slides?.length ?? 0);
        // Or return the number of slides that Swiper recognizes (may differ when loop=true)
        // return Promise.resolve(this.swiperInstance?.slides?.length ?? 0);
    }

    /** Returns the active real index (useful when loop: true). */
    getRealIndex(): Promise<number> {
        return Promise.resolve(this.swiperInstance?.realIndex ?? 0);
    }

    getSwiper(): Promise<Swiper | null> {
        return Promise.resolve(this.swiperInstance);
    }
}
