import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MostrarMapaPage } from './mostrar-mapa.page';

const routes: Routes = [
  {
    path: '',
    component: MostrarMapaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MostrarMapaPageRoutingModule {}
