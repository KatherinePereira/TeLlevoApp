import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ResumenViajePage } from './resumen-viaje.page';

const routes: Routes = [
  {
    path: '',
    component: ResumenViajePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResumenViajePageRoutingModule {}
