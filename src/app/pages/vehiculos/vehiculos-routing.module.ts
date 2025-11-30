import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VehiculosPage } from './vehiculos.page';

const routes: Routes = [
  {
    path: '',
    component: VehiculosPage
  },
  {
    path: 'detalle-vehiculos',
    loadChildren: () => import('../detalle-vehiculos/detalle-vehiculos.module').then( m => m.DetalleVehiculosPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VehiculosPageRoutingModule {}
