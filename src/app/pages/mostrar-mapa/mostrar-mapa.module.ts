import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MostrarMapaPageRoutingModule } from './mostrar-mapa-routing.module';

import { MostrarMapaPage } from './mostrar-mapa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MostrarMapaPageRoutingModule
  ],
  declarations: [MostrarMapaPage]
})
export class MostrarMapaPageModule {}
