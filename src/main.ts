import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment.prod';
import { enableProdMode } from '@angular/core';

import mapboxgl from 'mapbox-gl'; // or "const mapboxgl = require('mapbox-gl');"

mapboxgl.accessToken = 'pk.eyJ1Ijoia2EtcGVyZWlyYSIsImEiOiJjbTI3MWJnYmMxOHF2MmtwdnBiN3ppeHcyIn0.57SuQ82S_HpbP2F5MVbfEA';



if( !navigator.geolocation ){
  alert('Navegador no soporta geolocalización');
  throw new Error('Navegador no soporta geolocalización');
}

if(environment.production){
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
