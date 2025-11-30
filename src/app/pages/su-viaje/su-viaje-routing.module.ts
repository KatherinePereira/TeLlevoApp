import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SuViajePage } from './su-viaje.page';

const routes: Routes = [
  {
    path: '',
    component: SuViajePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuViajePageRoutingModule {}
