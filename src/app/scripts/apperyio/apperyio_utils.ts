import { Injectable } from '@angular/core';

@Injectable()
export class ApperyioUtilsService {
    selectCustomComparator(a, b) {
        if (
             (typeof a === "number" && typeof b === "string" && b)
          || (typeof b === "number" && typeof a === "string" && a)
        ) {
            return a == b;
        }
        return a === b;
    }
};
