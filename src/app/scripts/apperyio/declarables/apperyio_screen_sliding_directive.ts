import {
    Directive,
    ElementRef,
    Input,
    AfterViewInit,
    OnDestroy
} from '@angular/core';
import {
    ApperyioHelperService
} from '../apperyio_helper';


@Directive({
    standalone: false,
    selector: '[aioScreenSliding]'
})
export default class AioScreenSlidingDirective implements AfterViewInit, OnDestroy {
    @Input() aioScreenSliding!: string;
    private mutationObserver ? : MutationObserver;

    constructor(private hostRef: ElementRef < HTMLElement > , private $a: ApperyioHelperService) {}

    ngAfterViewInit(): void {
        const host = this.hostRef.nativeElement;
        // In case the element is already loaded during initialization
        const cl = host.classList;
        if (cl.contains('loaded') && !cl.contains('delayloaded')) {
            this.saveLoaded();
        } else {
            // Observe the change of classes (activating ion-tab-button adds the ion-selected/activated class)
            this.mutationObserver = new MutationObserver(mutations => {
                for (const m of mutations) {
                    if (m.type === 'attributes' && (m.attributeName === 'class' || m.attributeName === 'className')) {
                        const classList = (m.target as HTMLElement).classList;
                        if (classList.contains('loaded') && !classList.contains('delayloaded')) {
                            this.saveLoaded();
                        }
                    }
                }
            });
            this.mutationObserver.observe(host, {
                attributes: true,
                attributeFilter: ['class']
            });

        }
    }

    ngOnDestroy(): void {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = undefined;
        }
    }

    private saveLoaded() {
        if (this.$a.internalSettings._aioSlideShown?.[this.aioScreenSliding]) return;
        if (!this.$a.internalSettings._aioSlideShown) {
            this.$a.internalSettings._aioSlideShown = {};
        }
        this.$a.internalSettings._aioSlideShown[this.aioScreenSliding] = true;
    }

}
