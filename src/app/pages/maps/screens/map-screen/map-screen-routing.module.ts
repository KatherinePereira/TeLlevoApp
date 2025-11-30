import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MapScreenPage } from './map-screen.page';

const routes: Routes = [
  {
    path: '',
    component: MapScreenPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapScreenPageRoutingModule {}
