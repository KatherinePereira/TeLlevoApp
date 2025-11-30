import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapScreenPageRoutingModule } from './map-screen-routing.module';

import { MapScreenPage } from './map-screen.page';
import { LoadingComponent } from '../../components/loading/loading.component';
import { MapViewComponent } from '../../components/map-view/map-view.component';

import { BtnMyLocationComponent } from '../../components/btn-my-location/btn-my-location.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { SearchResultsComponent } from '../../components/search-results/search-results.component';
import { BtnConfirmarRutaComponent } from '../../components/btn-confirmar-ruta/btn-confirmar-ruta.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapScreenPageRoutingModule
  ],
  declarations: [MapScreenPage,
    LoadingComponent,
    MapViewComponent,
    BtnMyLocationComponent,
    SearchBarComponent,
    SearchResultsComponent,
    BtnConfirmarRutaComponent]
})
export class MapScreenPageModule {}
