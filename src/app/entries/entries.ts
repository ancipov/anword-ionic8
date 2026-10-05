import {
    Component
} from '@angular/core';
import {
    ChangeDetectorRef
} from '@angular/core';
import {
    ApperyioHelperService
} from '../scripts/apperyio/apperyio_helper';
import {
    ApperyioMappingHelperService
} from '../scripts/apperyio/apperyio_mapping_helper';
import {
    DataTableHelperService,
    DataTableOptions,
    SortingOptions,
    DATA_TABLE_MODES
} from '../scripts/apperyio/datatable_helper';
import {
    $aio_empty_object
} from '../scripts/interfaces';
import {
    ViewChild
} from '@angular/core';
@Component({
    standalone: false,
    templateUrl: 'entries.html',
    selector: 'page-entries',
    styleUrls: ['entries.css', 'entries.scss']
})
export class entries {
    public aioScreenName = "entries";
    public items: any;
    public keyword: string;
    public collectionName: string;
    public modalName: string;
    public copyItems: any;
    public $a: ApperyioHelperService;
    public $v: {
        [name: string]: any
    };
    public aioChangeDetector: ChangeDetectorRef;
    public currentItem: any = null;
    private _aioPrevNoBounce = false;
    @ViewChild('_aio_content') _aio_content;
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
    public __getDataTableMapping(data, property, defaultValue) {
        return this.$aio_mappingHelper.getDataTableMapping(data, property, defaultValue);
    }
    @ViewChild('j_141', {
        static: true
    }) public j_141;
    async ngOnInit(): Promise < any > {
        try {
            this.items = [{}, {}, {}];
            await this.refresh();
        } catch (e) {
            await this.$a.showError(e);
        }
        this.Apperyio.setThinScrollIfNeeded();
        this.$aio_DataTableHelper.initTableData(this, this.$aio_j_141);
    }
    ionViewWillEnter(): any {
        try {
            this.$v?.ionViewWillEnter?.call?.(this);
        } catch (e) {
            console.log(e);
        }
        document.documentElement.classList.toggle("aio-no-bounce", false);
        try {
            window.dispatchEvent(new Event('resize'));
        } catch (e) {
            this.$a.showError(e);
        }
        window.currentScreen = this;
    }
    async deleteItem(item, list?): Promise < any > {
        try {
            if (!await this.$a.alertOkCancelAsync("Are you sure?", "Item will be deleted")) return list?.closeSlidingItems();
            await this.$a.showLoading();
            await this.$a.db.remove(this.collectionName, item);
            this.$a.removeFromArray(this.items, item);
            for (let image of item.images) {
                await this.$a.db.deleteFile(image.fileName);
            }
            await this.$a.dismissLoading();
            this.$a.toast("Item was deleted");
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    async selectItem(item): Promise < any > {
        try {
            let data = await this.$a.modal(this.modalName, {
                collectionName: this.collectionName,
                item: _.cloneDeep(item)
            });
            if (data) this.$a.replaceObject(item, data);
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    async addItem(): Promise < any > {
        try {
            let data = await this.$a.modal(this.modalName, {
                collectionName: this.collectionName
            });
            if (data) this.items = [...this.items, data];
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    async refresh(event?): Promise < any > {
        try {
            this.items = await this.$a.db.query(this.collectionName, {
                where: {
                    userId: this.$v.user._id
                }
            });
            event?.target?.complete();
            this.copyItems = this.$a._.cloneDeep(this.items);
        } catch (e) {
            await this.$a.showError(e);
        }
    }
    filter(): any {
        if (!this.keyword) return this.items = this.copyItems;
        this.items = this.copyItems?.filter(item => this.$a.hasString(item.name, this.keyword));
    }
    constructor(public Apperyio: ApperyioHelperService, private $aio_mappingHelper: ApperyioMappingHelperService, private $aio_changeDetector: ChangeDetectorRef, private $aio_DataTableHelper: DataTableHelperService) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
        this.items = null;
        this.keyword = '';
        this.collectionName = 'Entries';
        this.modalName = 'entry';
        this.$aio_j_141 = {
            headerHeight: 50,
            footerHeight: 50,
            count: this.items?.length,
            limit: 10,
            rowHeight: "auto",
            offset: 0,
            mode: DATA_TABLE_MODES.CLIENT_PAGES,
            externalSorting: false,
            componentName: "j_141",
            dataServiceName: "",
            isRowsMapping: false,
            rows: [],
            isLoading: false,
            cssClasses: {
                sortAscending: "datatable-icon-up",
                sortDescending: "datatable-icon-down",
                pagerLeftArrow: "datatable-icon-left",
                pagerRightArrow: "datatable-icon-right",
                pagerPrevious: "datatable-icon-prev",
                pagerNext: "datatable-icon-next"
            },
            messages: {
                emptyMessage: this.$a.translate.instant("No data to display"),
                totalMessage: this.$a.translate.instant("total"),
                selectedMessage: this.$a.translate.instant("selected")
            },
            sorts: < SortingOptions > {}
        };
        this.aioChangeDetector = this.$aio_changeDetector;
    }
    ionViewWillLeave() {
        try {
            this.$v?.ionViewWillLeave?.call?.(this);
        } catch (e) {
            console.log(e);
        }
    }
    $aio_DataTableOnSort_j_141(e) {
        this.$aio_DataTableHelper.dataTableOnSort(e.sorts[0], this.$aio_j_141);
    }
    public $aio_j_141: DataTableOptions;
    private $aio_dataTables = {
        "DataTable": "$aio_j_141"
    };
}