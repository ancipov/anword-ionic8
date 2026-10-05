import {
    NgModule
} from '@angular/core';
import {
    CommonModule
} from '@angular/common';
import {
    MarkdownModule
} from 'ngx-markdown';

import 'prismjs';
import 'prismjs/components/prism-typescript.min.js';
import 'prismjs/components/prism-csharp.min.js';
import 'prismjs/components/prism-css.min.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import 'prismjs/plugins/line-highlight/prism-line-highlight.js';
/**
 *
 * See https://angular.io/guide/sharing-ngmodules, https://angular.io/api/core/NgModule for more info on Angular Modules.
 */
@NgModule({
    imports: [
        CommonModule,
        MarkdownModule.forRoot()
    ],
    declarations: [],
    exports: [MarkdownModule]
})

class MarkdownModuleModule {}

export {
    MarkdownModuleModule as ExportedClass
};