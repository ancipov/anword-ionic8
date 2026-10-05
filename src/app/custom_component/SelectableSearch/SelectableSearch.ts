import {
    Component
} from '@angular/core';
import {
    ChangeDetectorRef
} from '@angular/core';
import {
    ApperyioHelperService
} from '../../scripts/apperyio/apperyio_helper';
import {
    ApperyioMappingHelperService
} from '../../scripts/apperyio/apperyio_mapping_helper';
import {
    ViewChild
} from '@angular/core';
import {
    $aio_empty_object
} from '../../scripts/interfaces';
import {
    Input
} from '@angular/core';
import {
    Output
} from '@angular/core';
import {
    EventEmitter
} from '@angular/core';
import {
    ElementRef
} from '@angular/core';
import {
    ControlValueAccessor
} from '@angular/forms';
import {
    NG_VALUE_ACCESSOR
} from '@angular/forms';
import {
    NG_VALIDATORS
} from '@angular/forms';
import {
    Validator
} from '@angular/forms';
import {
    AbstractControl
} from '@angular/forms';
import {
    ValidationErrors
} from '@angular/forms';
import {
    forwardRef
} from '@angular/core';
@Component({
    standalone: false,
    templateUrl: 'SelectableSearch.html',
    selector: 'component-selectable-search',
    styleUrls: ['SelectableSearch.css', 'SelectableSearch.scss'],
    providers: [{
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SelectableSearch),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => SelectableSearch),
            multi: true,
        },
    ]
})
export class SelectableSearch implements ControlValueAccessor, Validator {
    public aioScreenName = "SelectableSearch";
    public selectedItem: any;
    @ViewChild('selectInput', {
        static: false
    }) public selectInput: any;
    public isFailedRequired: any;
    public showItems: any;
    public index: any;
    public isStringArray: any;
    public $a: ApperyioHelperService;
    public $v: {
        [name: string]: any
    };
    public aioChangeDetector: ChangeDetectorRef;
    public currentItem: any = null;
    private _aioPrevNoBounce = false;
    public mappingData: any = {};
    public __getMapping(_currentItem, property, defaultValue, isVariable?, isSelected?) {
        return this.$aio_mappingHelper.getMapping(this.mappingData, _currentItem, property, defaultValue, isVariable, isSelected);
    }
    public __isPropertyInMapping(_currentItem, property) {
        return this.$aio_mappingHelper.isPropertyInMapping(this.mappingData, _currentItem, property);
    }
    public __setMapping(data: any = {}, keyName: string, propName?: string): void {
        const changes = data.detail || {};
        if (propName) {
            this.mappingData = this.$aio_mappingHelper.updateData(this.mappingData, [keyName], changes[propName]);
        } else {
            this.mappingData = this.$aio_mappingHelper.updateData(this.mappingData, [keyName], changes.value);
        }
        this.$aio_changeDetector.detectChanges();
    }
    public __bindedMethods: any = {};
    @Input() public itemValueField: any;
    @Input() public itemTextField: any;
    @Input() public selectObject: any;
    @Input() public items: any;
    @Output() public onSelect: any = new EventEmitter();
    @Input() public placeholder: any;
    @Input() public canSearch: any;
    @Input() public required: any;
    /**
     * A callback executed when the content of the editor changes. Part of the
     * `ControlValueAccessor` (https://angular.io/api/forms/ControlValueAccessor) interface.
     *
     * Note: Unset unless the component uses the `ngModel`.
     */
    public ngModelOnChange?: (data: any) => void;
    /**
     * A callback executed when the editor has been blurred. Part of the
     * `ControlValueAccessor` (https://angular.io/api/forms/ControlValueAccessor) interface.
     *
     * Note: Unset unless the component uses the `ngModel`.
     */
    public ccOnTouched?: () => void;
    // Implementing the ControlValueAccessor interface (only when binding to ngModel).
    public writeValue(value: any | null): void {
        this.selectedItem = value;
    }
    // Implementing the ControlValueAccessor interface (only when binding to ngModel).
    public registerOnChange(callback: (data: any) => void): void {
        this.ngModelOnChange = callback;
    }
    // Implementing the ControlValueAccessor interface (only when binding to ngModel).
    public registerOnTouched(callback: () => void): void {
        this.ccOnTouched = callback;
    }
    // Implementing the ControlValueAccessor interface (only when binding to ngModel).
    public setDisabledState(isDisabled: boolean): void {}
    constructor(public Apperyio: ApperyioHelperService, private $aio_mappingHelper: ApperyioMappingHelperService, private $aio_changeDetector: ChangeDetectorRef, private _aio_host: ElementRef) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
        this.isStringArray = false;
        this.aioChangeDetector = this.$aio_changeDetector;
        this.checkArrayType();
        this.writeValue = (value) => {
            if (this.selectObject) {
                this.selectedItem = value;
            } else {
                let where = {};
                where[this.itemValueField] = value;
                this.selectedItem = this.$a._.find(this.items, where)
            }
            this.aioChangeDetector.detectChanges();
        }
    }
    ngOnInit(): any {
        this.checkArrayType();
        this.showItems = this.items?.slice(0, 20);
    }
    onChangeEvent(event): any {
        if (this.selectObject) {
            this.ngModelOnChange(this.selectedItem);
        } else {
            this.ngModelOnChange(this.selectedItem[this.itemValueField]);
        }
        this.onSelect.emit();
    }
    validate(control): any {
        if (!this.required) return null;
        if (!this.selectedItem && control.touched) {
            this.isFailedRequired = true;
            return {
                required: true
            }
        } else {
            this.isFailedRequired = false;
        }
    }
    markAsTouched(): any {
        this.selectInput?.nativeElement?.dispatchEvent(new Event("markAsTouched"));
        this.selectInput?._element?.nativeElement?.dispatchEvent(new Event("markAsTouched"));
        this.isFailedRequired = this.required && !this.selectedItem;
    }
    searchItems(event): any {
        let text = event.text.trim().toLowerCase();
        event.component.startSearch();
        this.index = 0;
        if (!event.component.items) event.component.items = [];
        while (event.component.items.length > 0) event.component.items.pop();
        this.getMoreItems(event);
        event.component.endSearch();
        event.component.enableInfiniteScroll();
    }
    getMoreItems(event): any {
        let text = (event.text || "").trim().toLowerCase();
        let count = 0;
        while (this.index < this.items.length && count < 20) {
            if (this.$a.hasString(this.items[this.index][this.itemTextField], text)) {
                event.component.items.push(this.items[this.index]);
                count++;
            }
            this.index++;
        }
        event.component.endInfiniteScroll();
    }
    checkArrayType(): any {
        if (typeof this.items?.[0] == 'string') {
            this.selectObject = false;
            this.itemTextField = 'text';
            this.itemValueField = 'value';
            this.items = this.items.map(el => {
                return {
                    text: el,
                    value: el
                }
            });
        }
    }
}