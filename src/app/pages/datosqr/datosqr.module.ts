import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DatosqrPageRoutingModule } from './datosqr-routing.module';

import { DatosqrPage } from './datosqr.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DatosqrPageRoutingModule
  ],
  declarations: [DatosqrPage]
})
export class DatosqrPageModule {}
