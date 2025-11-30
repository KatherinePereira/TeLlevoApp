import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VehiculosConductorPageRoutingModule } from './vehiculos-conductor-routing.module';

import { VehiculosConductorPage } from './vehiculos-conductor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VehiculosConductorPageRoutingModule
  ],
  declarations: [VehiculosConductorPage]
})
export class VehiculosConductorPageModule {}
