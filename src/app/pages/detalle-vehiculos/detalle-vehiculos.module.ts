import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleVehiculosPageRoutingModule } from './detalle-vehiculos-routing.module';

import { DetalleVehiculosPage } from './detalle-vehiculos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleVehiculosPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [DetalleVehiculosPage]
})
export class DetalleVehiculosPageModule {}
