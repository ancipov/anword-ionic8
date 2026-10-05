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
    ViewChild
} from '@angular/core';
@Component({
    standalone: false,
    templateUrl: 'AioCustomLoading.html',
    selector: 'component-aio-custom-loading',
    styleUrls: ['AioCustomLoading.css', 'AioCustomLoading.scss']
})
export class AioCustomLoading {
    public aioScreenName = "AioCustomLoading";
    public $a: ApperyioHelperService;
    public $v: {
        [name: string]: any
    };
    public aioChangeDetector: ChangeDetectorRef;
    public currentItem: any = null;
    private _aioPrevNoBounce = false;
    public mappingData: any = {
        "j_1__visible": false,
    };
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
    constructor(public Apperyio: ApperyioHelperService, private $aio_mappingHelper: ApperyioMappingHelperService, private $aio_changeDetector: ChangeDetectorRef, private _aio_host: ElementRef) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
        this.aioChangeDetector = this.$aio_changeDetector;
    }
}