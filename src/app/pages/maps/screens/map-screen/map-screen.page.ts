import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MapService, PlacesService } from '../../services';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';

@Component({
  selector: 'app-map-screen',
  templateUrl: './map-screen.page.html',
  styleUrls: ['./map-screen.page.scss'],
})
export class MapScreenPage implements OnInit, OnDestroy{
  @ViewChild(SearchBarComponent) searchBar!: SearchBarComponent;
  private watchId: number | null = null;
  private lastPosition: GeolocationPosition | null = null;

  constructor(private placesService: PlacesService, private mapService: MapService) { }

  ngOnInit() {
    this.startTrackingUserLocation();
  }

  ngOnDestroy() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }

  get isUserLocationReady(){
    return this.placesService.isUserLocationReady;
  }

  goToMyLocation(){

    if( !this.placesService.isUserLocationReady ) throw Error('No hay ubicaión de usuario');
    if( !this.mapService.isMapReady ) throw Error('No se a inicializado el mapa');
    
    this.mapService.flyto( this.placesService.userLocation! );
 
  }

  closeSearch() {
    if (this.searchBar) {
      this.searchBar.closeSearch();
    }
  }

  startTrackingUserLocation() {
    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.updateUserLocation(position);
        },
        (error) => {
          console.error('Error obteniendo la ubicación: ', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 3000,
        }
      );
    } else {
      console.error('Geolocalización no está soportada por este navegador');
    }
  }

  updateUserLocation(position: GeolocationPosition) {
    const { latitude, longitude } = position.coords;

    // Actualiza la ubicación del usuario en PlacesService
    this.placesService.userLocation = [longitude, latitude];

    // Suavizado del movimiento del marcador
    if (this.lastPosition) {
      const latDiff = latitude - this.lastPosition.coords.latitude;
      const lngDiff = longitude - this.lastPosition.coords.longitude;
      const smoothingFactor = 0.1; // Factor de suavizado ajustado

      const newLat = this.lastPosition.coords.latitude + latDiff * smoothingFactor;
      const newLng = this.lastPosition.coords.longitude + lngDiff * smoothingFactor;

      if (this.mapService.isMapReady) {
        console.log("Actualizando ubicación del usuario a:", [newLng, newLat]);
        this.mapService.updateUserMarker([newLng, newLat]);
      }
    } else {
      if (this.mapService.isMapReady) {
        console.log("Estableciendo ubicación del usuario a:", [longitude, latitude]);
        this.mapService.updateUserMarker([longitude, latitude]);
      }
    }

    this.lastPosition = position;
  }

}


