import {
    Directive,
    Optional,
    Self,
    ElementRef,
    AfterViewInit,
    NgZone,
    OnInit,
    OnDestroy
} from '@angular/core';
import {
    NgControl
} from '@angular/forms';

@Directive({
    standalone: false,
    selector: `
    ion-toggle[ngModel],
    ion-checkbox[ngModel],
    ion-select[ngModel],
    ion-input[ngModel],
    ion-radio-group[ngModel],
    ion-range[ngModel],
    ion-datetime[ngModel], aio-datetime[ngModel],
    ion-segment[ngModel],
    ion-textarea[ngModel],
    ion-searchbar[ngModel]
  `,
})
class PatchIonChangeDirective implements AfterViewInit {
    constructor(
        @Optional() @Self() private ngControl: NgControl,
        // private injector: Injector
    ) {}

    ngAfterViewInit() {
        const accessor = this.ngControl?.valueAccessor as any;
        let element = accessor?.['el'] || accessor?.['_elementRef'] || accessor?.['elementRef'];
        if (element?.nativeElement) {
            element = element.nativeElement;
        }

        if (!element || !accessor || typeof accessor.writeValue !== 'function') return;
        let initialized = false;
        setTimeout(() => { initialized = true; });

        const originalWriteValue = accessor.writeValue.bind(accessor);

        accessor.writeValue = (newValue: any) => {
            
            const prev = element?.checked != undefined ? element?.checked : element?.value;
            originalWriteValue(newValue);

            const value = element?.checked != undefined ? element?.checked : element?.value;
            if (!initialized) {
                initialized = true;
                return;
            }
            if (prev !== value && element?.dispatchEvent) {
                // emit ionChange event
                let detail;
                if (element.nodeName === 'ION-TOGGLE' || element.nodeName === 'ION-CHECKBOX') {
                    detail = {
                        value: element?.value,
                        checked: value
                    }
                } else {
                    detail = {
                        value
                    }
                }
                element.dispatchEvent(new CustomEvent('ionChange', {detail}));
            }
        };
    }
}


@Directive({
    standalone: false,
    selector: 'ion-input, ion-textarea, ion-searchbar'
})
class IonChangeAsIonInputDirective implements OnInit, OnDestroy {
  private listener = (ev: any) => {
    this.ngZone.run(() => {
      this.el.nativeElement.dispatchEvent(
        new CustomEvent('ionChange', {
          detail: ev.detail,
          bubbles: true,
        })
      );
    });
  };

  constructor(
    private el: ElementRef<HTMLElement>,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.el.nativeElement.addEventListener('ionInput', this.listener);
  }

  ngOnDestroy() {
    this.el.nativeElement.removeEventListener('ionInput', this.listener);
  }
}

export {PatchIonChangeDirective, IonChangeAsIonInputDirective};