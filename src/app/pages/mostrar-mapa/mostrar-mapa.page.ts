import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { GeocodingService } from '../../geocoding.service'; 
import { Observable } from 'rxjs';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-mostrar-mapa',
  templateUrl: './mostrar-mapa.page.html',
  styleUrls: ['./mostrar-mapa.page.scss'],
})
export class MostrarMapaPage implements AfterViewInit {
  private map!: L.Map;
  private currentLocation!: L.LatLng; // Almacenar la ubicación actual

  constructor(private geocodingService: GeocodingService, private platform: Platform) { }

  async ngAfterViewInit(): Promise<void>  {
    await this.platform.ready();
    this.initMap(); // Inicializa el mapa aquí
  }

  private initMap(): void {
    const initialLat = 0; // Latitud inicial (Santiago, Chile)
    const initialLng = 0; // Longitud inicial (Santiago, Chile)
    const initialZoom: number = 12; // Zoom inicial

    // Asegúrate de que el contenedor del mapa existe en el DOM
    this.map = L.map('map').setView([initialLat, initialLng], initialZoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    

    // Iniciar la geolocalización
    this.map.locate({ setView: true, maxZoom: 16 });
    this.map.on('locationfound', this.onLocationFound.bind(this));
    this.map.on('locationerror', this.onLocationError.bind(this));
    
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 1000);
  }

  private onLocationFound(e: L.LocationEvent): void {
    this.currentLocation = e.latlng; // Almacena la ubicación actual

    // Añadir un marcador en la ubicación detectada
    L.marker(this.currentLocation).addTo(this.map)
      .bindPopup("Estás aquí").openPopup();

    // Centrar el mapa en la ubicación actual
    this.map.setView(this.currentLocation, 16);

    // Aquí puedes llamar a la función para dibujar la ruta si ya tienes la ubicación final
    this.drawRoute();
  }

  private onLocationError(e: L.ErrorEvent): void {
    alert("Error de geolocalización: " + e.message);
  }

  private drawRoute(): void {
    const ubicacionFinal = localStorage.getItem('ubicacionFinal');
    
    if (ubicacionFinal) {
      const inicio = `${this.currentLocation.lat},${this.currentLocation.lng}`; 

      this.geocodeAddress(inicio).subscribe(
        (startCoords: any[]) => {
          this.geocodeAddress(ubicacionFinal).subscribe(
            (endCoords: any[]) => {
              if (startCoords.length > 0 && endCoords.length > 0) {
                const startLatLng: L.LatLngTuple = [startCoords[0].lat, startCoords[0].lon];
                const endLatLng: L.LatLngTuple = [endCoords[0].lat, endCoords[0].lon];

                L.marker(startLatLng).addTo(this.map).bindPopup("Ubicacion actual").openPopup();
                L.marker(endLatLng).addTo(this.map).bindPopup("Destino").openPopup();

                // Crear control de enrutamiento con instrucciones en español
                L.Routing.control({
                  waypoints: [
                    L.latLng(startLatLng[0], startLatLng[1]),
                    L.latLng(endLatLng[0], endLatLng[1])
                  ],
                  routeWhileDragging: true,
                  router: L.Routing.osrmv1({
                    serviceUrl: 'https://router.project-osrm.org/route/v1/',
                    language: 'es', // Especifica el idioma a español
                    profile: 'driving', // El perfil puede ser 'driving', 'walking', etc.
                  }),
                }).addTo(this.map);

                this.map.fitBounds([startLatLng, endLatLng]);
              } else {
                alert("No se encontraron coordenadas para la dirección final.");
              }
            },
            (error: any) => {
              console.error("Error al geocodificar la ubicación final", error);
              alert("Error al geocodificar la ubicación final.");
            }
          );
        },
        (error: any) => {
          console.error("Error al geocodificar la ubicación inicial", error);
          alert("Error al geocodificar la ubicación inicial.");
        }
      );
    }
  }

  private geocodeAddress(address: string): Observable<any> {
    return this.geocodingService.geocode(address);
  }
}
