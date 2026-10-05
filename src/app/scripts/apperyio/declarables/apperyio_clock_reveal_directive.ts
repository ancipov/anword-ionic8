import {
    Directive,
    ElementRef,
    Input,
    Renderer2,
    AfterViewInit,
    OnDestroy
  } from '@angular/core';
  
  @Directive({
    standalone: false,
    selector: '[aioClockReveal]'
  })
  export default class AioClockRevealDirective implements AfterViewInit, OnDestroy {
    @Input('revealDuration') revealDuration = 600; // ms
    @Input('revealStart') revealStart = '-90deg';    // from angle for conic-gradient (e.g. '-90deg' = from top)
    @Input('reverse') reverse = false;               // true = counterclockwise
    private mutationObserver?: MutationObserver;
    private rafId?: number;
    private animStartTime?: number;

    constructor(private hostRef: ElementRef<HTMLElement>, private renderer: Renderer2) {}
  
    ngAfterViewInit(): void {
      const host = this.hostRef.nativeElement;
      // Let's find the target element to apply the mask to: preferably an <img> inside, otherwise the host itself
      const img = host.querySelector('ion-icon');
      this.applyInitialStyles(img ?? host as HTMLElement);
      // Observe the change of classes (activating ion-tab-button adds the ion-selected/activated class)
      this.mutationObserver = new MutationObserver(mutations => {
        for (const m of mutations) {
          if (m.type === 'attributes' && (m.attributeName === 'class' || m.attributeName === 'className')) {
            const classList = (m.target as HTMLElement).classList;
            if (!this.rafId && (classList.contains('tab-selected') || classList.contains('ion-selected') || classList.contains('activated') || classList.contains('selected'))) {
              this.startAnimation(img ?? host as HTMLElement);
            }
          }
        }
      });
  
      this.mutationObserver.observe(host, { attributes: true, attributeFilter: ['class'] });
  
      // In case the element is already active during initialization, we launch
      const cl = host.classList;
      if (!this.rafId && (cl.contains('tab-selected') || cl.contains('ion-selected') || cl.contains('activated') || cl.contains('selected'))) {
        this.startAnimation(img ?? host as HTMLElement);
      }
    }
  
    ngOnDestroy(): void {
      if (this.mutationObserver) {
        this.mutationObserver.disconnect();
        this.mutationObserver = undefined;
      }
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }
    }
  
    // Setting up basic inline mask styles
    private applyInitialStyles(target: HTMLElement) {
      // The --angle variable will be controlled by JS via requestAnimationFrame
      this.renderer.setStyle(target, '--angle', '0deg');
      // Apply a conic-gradient mask; add -webkit- for Safari/Chrome
      const conic = `conic-gradient(from ${this.revealStart}, white 0deg, white var(--angle), transparent var(--angle) 360deg)`;
      this.renderer.setStyle(target, '-webkit-mask-image', conic);
      this.renderer.setStyle(target, 'mask-image', conic);
      this.renderer.setStyle(target, '-webkit-mask-repeat', 'no-repeat');
      this.renderer.setStyle(target, 'mask-repeat', 'no-repeat');
      this.renderer.setStyle(target, '-webkit-mask-position', 'center');
      this.renderer.setStyle(target, 'mask-position', 'center');
      this.renderer.setStyle(target, '-webkit-mask-size', '100% 100%');
      this.renderer.setStyle(target, 'mask-size', '100% 100%');
  
      // Backup style: display block (for <img>), object-fit - if image
      if (target.tagName.toLowerCase() === 'img') {
        this.renderer.setStyle(target, 'display', 'block');
        this.renderer.setStyle(target, 'width', '100%');
        this.renderer.setStyle(target, 'height', '100%');
        this.renderer.setStyle(target, 'object-fit', 'contain');
      }
    }
  
    // Animate the --angle variable from 0deg to 360deg (or to -360deg for reverse)
    private startAnimation(target: HTMLElement) {
      const duration = Math.max(1, this.revealDuration);
      const sign = this.reverse ? -1 : 1;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }
      this.animStartTime = performance.now();
      const step = () => {
        const t = Math.min(1, (performance.now() - this.animStartTime) / duration);
        let angle = Math.round(360 * t * sign);
        target.style.setProperty('--angle', angle + 'deg');
  
        if (t < 1) {
          this.rafId = requestAnimationFrame(step);
        } else {
          // We guarantee the final value
          target.style.setProperty('--angle', (360 * sign) + 'deg');
          this.rafId = undefined;
        }
      };
        this.rafId = requestAnimationFrame(step);
    }
  }
  