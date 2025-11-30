import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResumenViajePageRoutingModule } from './resumen-viaje-routing.module';

import { ResumenViajePage } from './resumen-viaje.page';
import { CrearViajePageModule } from '../crear-viaje/crear-viaje.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResumenViajePageRoutingModule,
  ],
  declarations: [ResumenViajePage]
})
export class ResumenViajePageModule {}
