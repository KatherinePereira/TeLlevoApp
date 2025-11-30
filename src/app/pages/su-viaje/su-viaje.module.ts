import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SuViajePageRoutingModule } from './su-viaje-routing.module';

import { SuViajePage } from './su-viaje.page';
import { RouterModule } from '@angular/router';
import { BarcodeScanningModalComponent } from './barcode-scanning-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SuViajePageRoutingModule,
    RouterModule.forChild([{ path: '', component: SuViajePage, }]),
  ],
  declarations: [SuViajePage, BarcodeScanningModalComponent]
})
export class SuViajePageModule {}
