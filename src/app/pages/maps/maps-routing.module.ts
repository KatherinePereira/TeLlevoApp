import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MapsPage } from './maps.page';

const routes: Routes = [
  {
    path: '',
    component: MapsPage
  },  {
    path: 'map-screen',
    loadChildren: () => import('./screens/map-screen/map-screen.module').then( m => m.MapScreenPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapsPageRoutingModule {}
