import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import mapboxgl from 'mapbox-gl';
import { ViajesService } from 'src/app/services/viajes.service';
import { MapService, PlacesService } from '../maps/services';
import { MensajesService } from 'src/app/services/mensajes.service';
import { MenuController, Platform } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UbicacionesService } from 'src/app/services/ubicaciones.service';
import { Subscription } from 'rxjs';

interface ResumenViajeState {
  precio: number;
  numAsientos: number;
  coordenadasRuta: [number, number][]; 
  startCoordinates: [number, number]; 
  endCoordinates: [number, number];
  viajeId: string;
}

@Component({
  selector: 'app-resumen-viaje',
  templateUrl: './resumen-viaje.page.html',
  styleUrls: ['./resumen-viaje.page.scss'],
})
export class ResumenViajePage implements OnInit, AfterViewInit, OnDestroy {
  precio: number | undefined;
  numAsientos: number | undefined;
  coordenadasRuta: [number, number][] = [];
  startCoordinates: [number, number] = [0, 0];
  endCoordinates: [number, number] = [0, 0];
  map: mapboxgl.Map | undefined;
  carMarker: mapboxgl.Marker | undefined;
  viajeId: string | undefined;
  backButtonSubscription: any; 
  ubicacionSubscription: Subscription | undefined;
  viajeSubscription: Subscription | undefined;
  viaje: any;
  private previousNumAsientos: number | undefined;

  @ViewChild('mapDiv', { static: false }) mapDiv!: ElementRef;

  constructor(
    private router: Router, 
    private viajesService: ViajesService,
    private mensajeService: MensajesService,
    private menu: MenuController,
    private firestore: AngularFirestore,
    private ubicacionService: UbicacionesService,
  ) {}


  ngOnInit() {
    this.menu.enable(false);
  
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const state = navigation.extras.state as ResumenViajeState;
      this.precio = state.precio;
      this.numAsientos = state.numAsientos;
      this.coordenadasRuta = state.coordenadasRuta;
      this.startCoordinates = state.startCoordinates;
      this.endCoordinates = state.endCoordinates;
      this.viajeId = state.viajeId;
  
      this.enviarUbicacionContinuamente(); // Envía la ubicación cada cierto tiempo
      this.alertCapacidad();
    }

    // Escuchar la ubicación en tiempo real
    this.ubicacionSubscription = this.ubicacionService.ubicacionActual$.subscribe(
      (ubicacion) => this.updateUserLocation(this.viajeId!, ubicacion)
    );
  }

  enviarUbicacionContinuamente() {
    if (this.viajeId) {
      navigator.geolocation.watchPosition(
        (position) => {
          const ubicacion = {
            lng: position.coords.longitude,
            lat: position.coords.latitude,
          };
          console.log('Ubicación actual:', ubicacion);
  
          // Verifica si el documento existe antes de actualizar
          this.firestore.collection('viajes').doc(this.viajeId).get().toPromise().then(doc => {
            if (doc && doc.exists) {
              // Solo actualiza si el documento existe
              return this.firestore.collection('viajes').doc(this.viajeId).update({
                ubicacionActual: ubicacion,
              }).then(() => {
                this.updateUserLocation(this.viajeId!, ubicacion);
              });
            } else {
              console.error('El documento no existe o es indefinido');
              return null; // Se asegura de retornar un valor
            }
          }).catch((error) => {
            console.error('Error al obtener el documento:', error);
            return null;
          });
        },
        (error) => console.error('Error al obtener la ubicación:', error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.error('viajeId es indefinido');
    }
  }  

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    this.menu.enable(true);
    if (this.ubicacionSubscription) {
      this.ubicacionSubscription.unsubscribe();
    }
    if (this.viajeSubscription) {
      this.viajeSubscription.unsubscribe();
    }
    if (this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe();
    }
  }

  initMap() {
    if (this.coordenadasRuta.length > 0) {
      mapboxgl.accessToken = 'pk.eyJ1Ijoia2EtcGVyZWlyYSIsImEiOiJjbTI3MWJnYmMxOHF2MmtwdnBiN3ppeHcyIn0.57SuQ82S_HpbP2F5MVbfEA';
  
      this.map = new mapboxgl.Map({
        container: this.mapDiv.nativeElement,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: this.coordenadasRuta[0],
        zoom: 14,
      });
  
      this.map.on('load', () => {
        if (!this.map) return; 

        const carIcon = document.createElement('div');
        carIcon.className = 'car-icon';
        carIcon.style.backgroundImage = 'url("/assets/icon/car_rojo.png")';
        carIcon.style.width = '45px';
        carIcon.style.height = '45px';
        carIcon.style.backgroundSize = 'contain';
        carIcon.style.backgroundRepeat = 'no-repeat'; 

        // Verifica si el mapa está definido antes de agregar el marcador
        if (this.map) {
          this.carMarker = new mapboxgl.Marker(carIcon)
            .setLngLat(this.startCoordinates)
            .addTo(this.map);

          new mapboxgl.Marker({ color: 'blue' })
            .setLngLat(this.endCoordinates)
            .addTo(this.map);
        }

        if (this.map) {
          this.map.addSource('ruta', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: this.coordenadasRuta,
              },
              properties: {},
            },
          });

          this.map.addLayer({
            id: 'ruta',
            type: 'line',
            source: 'ruta',
            layout: {
              'line-cap': 'round',
              'line-join': 'round',
            },
            paint: {
              'line-color': 'black',
              'line-width': 3,
            },
          });
        }

        // Ajustar los límites del mapa
        if (this.map) {
          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend(this.startCoordinates);
          bounds.extend(this.endCoordinates);
          this.coordenadasRuta.forEach(coord => bounds.extend(coord));
          this.map.fitBounds(bounds, { padding: 50 });
        }
      });
    }
  }

  updateUserLocation(viajeId: string, ubicacion: { lng: number; lat: number }) {
    if (!this.carMarker) return; // Evita actualizar si no existe el marcador del conductor
    
    console.log('Actualizando ubicación del conductor en el mapa:', ubicacion);
    this.carMarker.setLngLat([ubicacion.lng, ubicacion.lat]);
  }  

  obtenerViajeId() {
    if (!this.viajeId) {
      console.error('No se ha definido el viajeId');
      return;
    }
  
    this.viajesService.obtenerViajePorId(this.viajeId).subscribe(viaje => {
      console.log('Viaje obtenido: ', viaje);
    });
    return this.viajeId;
  }

  async confirmarFinalizacion() {
    const resp = await this.mensajeService.mensajeDosBotones(
      '¿Estás seguro de que deseas terminar el viaje?',
      'Si sales de esta pantalla, el viaje se dará por finalizado.',
      'warning',
      'Aceptar',
      'Cancelar'
    );

    if (resp.isConfirmed) {
      this.redirigirHome();
      this.mensajeService.mensaje('Viaje finalizado', 'El viaje ha sido finalizado con éxito.', 'success');
    }
  }

  async redirigirHome() {
    try {
      const viajeId = this.obtenerViajeId();
      if (!viajeId) {
        throw new Error('No se ha encontrado el ID del viaje.');
      }
      await this.viajesService.finalizarViaje(viajeId);
      this.router.navigate(['/home2']);
    } catch (error) {
      console.error('Error al finalizar el viaje: ', error);
    }
  }

  alertCapacidad() {
    if (this.viajeId) {
      this.viajeSubscription = this.firestore
        .collection('viajes')
        .doc(this.viajeId)
        .valueChanges()
        .subscribe((viaje: any) => {
          if (viaje) {
            const currentNumAsientos = viaje.numAsientos;

            // Comparar con el número anterior
            if (this.previousNumAsientos !== undefined) {
              if (currentNumAsientos > this.previousNumAsientos) {
                this.mensajeService.mensaje('¡Un usuario se ha retirado del viaje!', `Ahora hay ${currentNumAsientos} asientos disponibles.`, 'info');
              } else if (currentNumAsientos < this.previousNumAsientos) {
                this.mensajeService.mensaje('¡Un usuario se ha unido al viaje!', `Ahora hay ${currentNumAsientos} asientos disponibles.`, 'warning');
              }
            }

            this.previousNumAsientos = currentNumAsientos;
            this.numAsientos = currentNumAsientos;
          }
        });
    }
  }

}
