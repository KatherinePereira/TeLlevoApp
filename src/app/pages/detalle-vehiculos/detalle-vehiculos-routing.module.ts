import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleVehiculosPage } from './detalle-vehiculos.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleVehiculosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleVehiculosPageRoutingModule {}
