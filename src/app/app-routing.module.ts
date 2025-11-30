import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { CamaraPage } from './pages/viaje/camara/camara.page';
import { PasajeroPage } from './pages/pasajero/pasajero.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'splashscreen',
    pathMatch: 'full'
  },
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'splashscreen',
    loadChildren: () => import('./pages/splashscreen/splashscreen.module').then( m => m.SplashscreenPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'conductor',
    loadChildren: () => import('./pages/conductor/conductor.module').then( m => m.ConductorPageModule)
  },
  {
    path: 'pasajero',
    loadChildren: () => import('./pages/pasajero/pasajero.module').then( m => m.PasajeroPageModule)
  },
  {
    path: 'registrarse',
    loadChildren: () => import('./pages/registrarse/registrarse.module').then( m => m.RegistrarsePageModule)
  },
  {
    path: 'admin-dashboard',
    loadChildren: () => import('./pages/admin/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: 'recuperar',
    loadChildren: () => import('./pages/recuperar/recuperar.module').then( m => m.RecuperarPageModule)
  },
  {
    path: 'home2',
    loadChildren: () => import('./pages/home2/home2.module').then( m => m.Home2PageModule)
  },
  {
    path: 'crear-viaje',
    loadChildren: () => import('./pages/crear-viaje/crear-viaje.module').then( m => m.CrearViajePageModule)
  },
  {
    path: 'resumen-viaje',
    loadChildren: () => import('./pages/resumen-viaje/resumen-viaje.module').then( m => m.ResumenViajePageModule)
  },
  {
    path: 'su-viaje/:patente',
    loadChildren: () => import('./pages/su-viaje/su-viaje.module').then( m => m.SuViajePageModule)
  },
  {
    path: 'qr',
    loadChildren: () => import('./pages/qr/qr.module').then( m => m.QrPageModule)
  },
  {
    path: 'viaje/:patente',
    loadChildren: () => import('./pages/viaje/viaje.module').then( m => m.ViajePageModule)
  },
  {
    path: 'vehiculos',
    loadChildren: () => import('./pages/vehiculos/vehiculos.module').then( m => m.VehiculosPageModule)
  },
  {
    path: 'detalle-vehiculos',
    loadChildren: () => import('./pages/detalle-vehiculos/detalle-vehiculos.module').then( m => m.DetalleVehiculosPageModule)
  },
  {
    path: 'edit-user/:uid',
    loadChildren: () => import('./pages/edit-user/edit-user.module').then( m => m.EditUserPageModule)
  },
  {
    path: 'vehiculosConductor',
    loadChildren: () => import('./pages/vehiculos-conductor/vehiculos-conductor.module').then( m => m.VehiculosConductorPageModule)
  },
  {
    path: 'mis-datos',
    loadChildren: () => import('./pages/mis-datos/mis-datos.module').then( m => m.MisDatosPageModule)
  },
  {
    path: 'mostrar-mapa',
    loadChildren: () => import('./pages/mostrar-mapa/mostrar-mapa.module').then( m => m.MostrarMapaPageModule)
  },
  {
    path: 'maps',
    loadChildren: () => import('./pages/maps/maps.module').then( m => m.MapsPageModule)
  },
  {
    path: 'camara',
    loadChildren: () => import('./pages/viaje/camara/camara.module').then( m => m.CamaraPageModule)
  },
  {
    path: 'datosqr/:uid',
    loadChildren: () => import('./pages/datosqr/datosqr.module').then( m => m.DatosqrPageModule)
  }
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
