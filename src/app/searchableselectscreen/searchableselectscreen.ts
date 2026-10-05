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
    $aio_empty_object
} from '../scripts/interfaces';
import {
    ViewChild
} from '@angular/core';
@Component({
    standalone: false,
    templateUrl: 'searchableselectscreen.html',
    selector: 'page-searchableselectscreen',
    styleUrls: ['searchableselectscreen.css', 'searchableselectscreen.scss']
})
export class searchableselectscreen {
    public aioScreenName = "searchableselectscreen";
    public selectedState: any;
    public states: any;
    public selectedValue: any;
    public selectedColor: any;
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
    constructor(public Apperyio: ApperyioHelperService, private $aio_mappingHelper: ApperyioMappingHelperService, private $aio_changeDetector: ChangeDetectorRef) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
        this.states = [{
            "name": "Alabama",
            "abbreviation": "AL"
        }, {
            "name": "Alaska",
            "abbreviation": "AK"
        }, {
            "name": "American Samoa",
            "abbreviation": "AS"
        }, {
            "name": "Arizona",
            "abbreviation": "AZ"
        }, {
            "name": "Arkansas",
            "abbreviation": "AR"
        }, {
            "name": "California",
            "abbreviation": "CA"
        }, {
            "name": "Colorado",
            "abbreviation": "CO"
        }, {
            "name": "Connecticut",
            "abbreviation": "CT"
        }, {
            "name": "Delaware",
            "abbreviation": "DE"
        }, {
            "name": "District Of Columbia",
            "abbreviation": "DC"
        }, {
            "name": "Federated States Of Micronesia",
            "abbreviation": "FM"
        }, {
            "name": "Florida",
            "abbreviation": "FL"
        }, {
            "name": "Georgia",
            "abbreviation": "GA"
        }, {
            "name": "Guam",
            "abbreviation": "GU"
        }, {
            "name": "Hawaii",
            "abbreviation": "HI"
        }, {
            "name": "Idaho",
            "abbreviation": "ID"
        }, {
            "name": "Illinois",
            "abbreviation": "IL"
        }, {
            "name": "Indiana",
            "abbreviation": "IN"
        }, {
            "name": "Iowa",
            "abbreviation": "IA"
        }, {
            "name": "Kansas",
            "abbreviation": "KS"
        }, {
            "name": "Kentucky",
            "abbreviation": "KY"
        }, {
            "name": "Louisiana",
            "abbreviation": "LA"
        }, {
            "name": "Maine",
            "abbreviation": "ME"
        }, {
            "name": "Marshall Islands",
            "abbreviation": "MH"
        }, {
            "name": "Maryland",
            "abbreviation": "MD"
        }, {
            "name": "Massachusetts",
            "abbreviation": "MA"
        }, {
            "name": "Michigan",
            "abbreviation": "MI"
        }, {
            "name": "Minnesota",
            "abbreviation": "MN"
        }, {
            "name": "Mississippi",
            "abbreviation": "MS"
        }, {
            "name": "Missouri",
            "abbreviation": "MO"
        }, {
            "name": "Montana",
            "abbreviation": "MT"
        }, {
            "name": "Nebraska",
            "abbreviation": "NE"
        }, {
            "name": "Nevada",
            "abbreviation": "NV"
        }, {
            "name": "New Hampshire",
            "abbreviation": "NH"
        }, {
            "name": "New Jersey",
            "abbreviation": "NJ"
        }, {
            "name": "New Mexico",
            "abbreviation": "NM"
        }, {
            "name": "New York",
            "abbreviation": "NY"
        }, {
            "name": "North Carolina",
            "abbreviation": "NC"
        }, {
            "name": "North Dakota",
            "abbreviation": "ND"
        }, {
            "name": "Northern Mariana Islands",
            "abbreviation": "MP"
        }, {
            "name": "Ohio",
            "abbreviation": "OH"
        }, {
            "name": "Oklahoma",
            "abbreviation": "OK"
        }, {
            "name": "Oregon",
            "abbreviation": "OR"
        }, {
            "name": "Palau",
            "abbreviation": "PW"
        }, {
            "name": "Pennsylvania",
            "abbreviation": "PA"
        }, {
            "name": "Puerto Rico",
            "abbreviation": "PR"
        }, {
            "name": "Rhode Island",
            "abbreviation": "RI"
        }, {
            "name": "South Carolina",
            "abbreviation": "SC"
        }, {
            "name": "South Dakota",
            "abbreviation": "SD"
        }, {
            "name": "Tennessee",
            "abbreviation": "TN"
        }, {
            "name": "Texas",
            "abbreviation": "TX"
        }, {
            "name": "Utah",
            "abbreviation": "UT"
        }, {
            "name": "Vermont",
            "abbreviation": "VT"
        }, {
            "name": "Virgin Islands",
            "abbreviation": "VI"
        }, {
            "name": "Virginia",
            "abbreviation": "VA"
        }, {
            "name": "Washington",
            "abbreviation": "WA"
        }, {
            "name": "West Virginia",
            "abbreviation": "WV"
        }, {
            "name": "Wisconsin",
            "abbreviation": "WI"
        }, {
            "name": "Wyoming",
            "abbreviation": "WY"
        }];
        this.aioChangeDetector = this.$aio_changeDetector;
    }
    ngOnInit() {
        this.Apperyio.setThinScrollIfNeeded();
    }
    ionViewWillEnter() {
        document.documentElement.classList.toggle("aio-no-bounce", false);
        window.currentScreen = this;
        try {
            this.$v?.ionViewWillEnter?.call?.(this);
        } catch (e) {
            console.log(e);
        }
    }
    ionViewWillLeave() {
        try {
            this.$v?.ionViewWillLeave?.call?.(this);
        } catch (e) {
            console.log(e);
        }
    }
}