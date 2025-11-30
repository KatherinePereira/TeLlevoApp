import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ViajesService } from 'src/app/services/viajes.service';
import { UbicacionesService } from 'src/app/services/ubicaciones.service';
import { Subscription } from 'rxjs';
import mapboxgl from 'mapbox-gl';
import { MensajesService } from 'src/app/services/mensajes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuController, ModalController, Platform } from '@ionic/angular';
import { AuthService } from 'src/app/services/firebase/auth.service';

@Component({
  selector: 'app-su-viaje',
  templateUrl: './su-viaje.page.html',
  styleUrls: ['./su-viaje.page.scss'],
})
export class SuViajePage implements OnInit, AfterViewInit, OnDestroy {
  patente: string = '';
  viaje: any;
  capacidad: number | undefined; 
  map!: mapboxgl.Map;
  carMarker: mapboxgl.Marker | null = null;
  ultimaUbicacion: { lat: number; lng: number } | null = null;
  conductorActivo: boolean = false;
  backButtonSubscription: any; 
  tipoUsuario: string | null = null; 
  salirCargando: boolean = false; 
  userLocationMarker: mapboxgl.Marker | null = null;
  ultimaUbicacionConductor: { lat: number; lng: number } | null = null;
  ultimaUbicacionUsuario: { lat: number; lng: number } | null = null;


  @ViewChild('mapDiv', { static: false }) mapDiv!: ElementRef;
  private ubicacionSub!: Subscription;
  private esConductorActivoSub!: Subscription;

  scanResult = '';

  constructor(
    private viajesService: ViajesService,
    private ubicacionService: UbicacionesService,
    private mensajeService: MensajesService,
    private route: ActivatedRoute,
    private router: Router,
    private menu: MenuController,
    private authService: AuthService,
    private modalController: ModalController,
    private platform: Platform
  ) {}


  ngOnInit() {
    this.menu.enable(false);
    this.patente = this.route.snapshot.paramMap.get('patente')!;
    this.obtenerDatosViaje();

    // Suscribirse al estado del conductor activo
    this.esConductorActivoSub = this.ubicacionService.esConductorActivo$.subscribe(
      (activo) => {
        this.conductorActivo = activo;
      }
    );
  }

  ngAfterViewInit() {
    this.initMap();
    this.startTrackingUserLocation();
  }

  ngOnDestroy() {
    if (this.ubicacionSub) this.ubicacionSub.unsubscribe();
    if (this.esConductorActivoSub) this.esConductorActivoSub.unsubscribe();

    this.ubicacionService.setConductorActivo(false);
  }

  obtenerDatosViaje() {
    if (this.patente) {
      this.viajesService.obtenerViajePorPatente(this.patente).subscribe(
        async (viaje) => {
          if (viaje) {
            this.viaje = viaje;
            this.ubicacionService.setConductorActivo(true);
            this.initMap();
            this.ubicacionService.escucharUbicacion(this.viaje.viajeId);
            this.ubicacionSub = this.ubicacionService.ubicacionActual$.subscribe(
              (ubicacion) => this.updateCarLocation(ubicacion)
            );
          } else {
            this.mensajeService.show('Viaje no encontrado');
          }
        },
        (error) => {
          console.error('Error al obtener el viaje:', error);
          this.mensajeService.show('Error al obtener los datos del viaje.');
        }
      );
    } else {
      this.mensajeService.show('Patente no proporcionada');
    }
  }
  

  initMap() {
    if (this.map || !this.mapDiv || !this.viaje) return;

    const startCoordinates: [number, number] = this.viaje.ubicacionInicial;
    const endCoordinates: [number, number] = this.viaje.ubicacionFinal;

    this.map = new mapboxgl.Map({
      container: this.mapDiv.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: startCoordinates,
      zoom: 14,
    });

    this.map.on('load', () => {
      this.addMarkers(startCoordinates, endCoordinates);
      this.getRoute(startCoordinates, endCoordinates);
    });
  }

  updateCarLocation(ubicacion: { lat: number; lng: number }) {
    if (!this.conductorActivo) {
      console.log('Conductor inactivo, no se actualiza la ubicación.');
      return;
    }

    if (!this.ultimaUbicacionConductor) {
      this.ultimaUbicacionConductor = ubicacion;
    }

    if (
      this.ultimaUbicacionConductor.lat === ubicacion.lat &&
      this.ultimaUbicacionConductor.lng === ubicacion.lng
    ) {
      return; // No actualizar si no ha cambiado
    }

    this.ultimaUbicacionConductor = ubicacion;

    if (this.carMarker) {
      this.carMarker.setLngLat([ubicacion.lng, ubicacion.lat]);
    } else {
      const carIcon = document.createElement('div');
      carIcon.className = 'car-icon';
      carIcon.style.backgroundImage = 'url("/assets/icon/car_rojo.png")';
      carIcon.style.width = '45px';
      carIcon.style.height = '45px';
      carIcon.style.backgroundSize = 'contain';
      carIcon.style.backgroundRepeat = 'no-repeat';

      this.carMarker = new mapboxgl.Marker(carIcon)
        .setLngLat([ubicacion.lng, ubicacion.lat])
        .addTo(this.map);
    }
  }

  startTrackingUserLocation() {
    if (!navigator.geolocation) {
        console.error('Geolocalización no está soportada por este navegador.');
        return;
    }

    navigator.geolocation.watchPosition(
        (position) => {
            const userUbicacion = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            console.log('Ubicación del usuario:', userUbicacion);

            // Llama al servicio para actualizar la ubicación del usuario
            this.ubicacionService.actualizarUbicacionUsuario(userUbicacion.lat, userUbicacion.lng);

            // Actualiza el marcador de la ubicación del usuario
            this.updateUserLocationMarker(userUbicacion);
        },
        (error) => {
            console.error('Error al obtener la ubicación del usuario:', error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
  }

  private updateUserLocationMarker(ubicacion: { lat: number; lng: number }) {
    if (!this.userLocationMarker) {
        this.userLocationMarker = new mapboxgl.Marker({ color: 'red' })
            .setLngLat([ubicacion.lng, ubicacion.lat])
            .addTo(this.map);
    } else {
        // Actualizar la ubicación del marcador existente
        this.userLocationMarker.setLngLat([ubicacion.lng, ubicacion.lat]);
    }
  }
  

  addMarkers(start: [number, number], end: [number, number]) {
    if (this.carMarker) {
      this.carMarker.remove();
      this.carMarker = null;
    }

    const carIcon = document.createElement('div');
    carIcon.className = 'car-icon';
    carIcon.style.backgroundImage = 'url("/assets/icon/car_rojo.png")';
    carIcon.style.width = '45px';
    carIcon.style.height = '45px';
    carIcon.style.backgroundSize = 'contain';
    carIcon.style.backgroundRepeat = 'no-repeat';

    this.carMarker = new mapboxgl.Marker(carIcon)
      .setLngLat(start)
      .addTo(this.map);

    new mapboxgl.Marker({ color: 'blue' }).setLngLat(end).addTo(this.map);
  }

  getRoute(start: [number, number], end: [number, number]) {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=pk.eyJ1Ijoia2EtcGVyZWlyYSIsImEiOiJjbTI3MWJnYmMxOHF2MmtwdnBiN3ppeHcyIn0.57SuQ82S_HpbP2F5MVbfEA`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0].geometry.coordinates;

          if (this.map.getSource('ruta')) {
            this.map.removeLayer('ruta');
            this.map.removeSource('ruta');
          }

          this.map.addSource('ruta', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: route,
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
        } else {
          this.mensajeService.show('No se pudo obtener la ruta.');
        }
      })
      .catch((error) => {
        console.error('Error al obtener la ruta:', error);
        this.mensajeService.show('Error al obtener la ruta. Intenta de nuevo más tarde.');
      });
  }

  async confirmarSalir() {
    if (this.salirCargando) return; // Para que no se pueda apretar el botón varias veces
    this.salirCargando = true;

    const resp = await this.mensajeService.mensajeDosBotones(
      '¿Estás seguro de que deseas salir del viaje?',
      'Si sales de esta pantalla, se confirmará que saliste del viaje.',
      'warning',
      'Aceptar',
      'Cancelar'
    );

    if (resp.isConfirmed) {
      this.mensajeService.mensaje('Saliste del viaje', 'Te haz salido del viaje con éxito, llegaste a tu destino.', 'success');

      const numAsientosActual = parseInt(this.viaje.numAsientos);
      if (!isNaN(numAsientosActual)) {
        const nuevaCapacidad = numAsientosActual + 1;

        try {
          await this.viajesService.actualizarCapacidadViaje(this.viaje.viajeId, nuevaCapacidad);

          const uid = this.viaje.uid;
          const tipoUsuario = await this.authService.getTipoUsuario(uid);

          if (tipoUsuario === 'conductor') {
            this.router.navigate(['/home2']);
          } else if (tipoUsuario === 'pasajero') {
            this.router.navigate(['/home']);
          } else {
            this.mensajeService.show('Tipo de usuario no reconocido.');
          }
        } catch (error) {
          console.error('Error al actualizar la capacidad:', error);
          this.mensajeService.show('Error al salir del viaje. Intenta nuevamente.');
          this.salirCargando = false;
        }
      } else {
        this.mensajeService.show('No se puede salir del viaje. Información no disponible.');
        this.salirCargando = false;
      }
    } else {
      this.salirCargando = false;
    }
  }

}
