import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DatosqrPage } from './datosqr.page';

const routes: Routes = [
  {
    path: '',
    component: DatosqrPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DatosqrPageRoutingModule {}
