import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonEditorComponent } from 'ang-jsoneditor' 
/**
 *
 * See https://angular.io/guide/sharing-ngmodules, https://angular.io/api/core/NgModule for more info on Angular Modules.
 */
@NgModule({
  imports: [
    CommonModule,
    JsonEditorComponent
  ],
  declarations: [],
  exports: [JsonEditorComponent]
})

class JsonModuleModule { }

export { JsonModuleModule as ExportedClass };