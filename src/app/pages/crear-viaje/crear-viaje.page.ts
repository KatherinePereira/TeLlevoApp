// CrearViajePage
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import mapboxgl from 'mapbox-gl';
import { MapService, PlacesService } from '../maps/services';
import { MensajesService } from 'src/app/services/mensajes.service';
import { Vehiculo } from 'src/app/interfaces/vehiculo';
import { Usuario } from 'src/app/interfaces/usuario';

@Component({
  selector: 'app-crear-viaje',
  templateUrl: './crear-viaje.page.html',
  styleUrls: ['./crear-viaje.page.scss'],
})
export class CrearViajePage implements OnInit, AfterViewInit {
  numAsientos: number | undefined;
  precio: number | undefined;
  ubicacion: [number, number];
  userData: Usuario | undefined;
  vehiculoData: Vehiculo | undefined;
  loading: boolean = false;
  coordenadasRuta: [number, number][] | undefined;
  startCoordinates: [number, number] | undefined;
  endCoordinates: [number, number] | undefined;
  map: mapboxgl.Map | undefined;
  viajeFinalizado: boolean = false;
  viajeId: string = '';
  viajeConCupo: boolean = true;

  @ViewChild('mapDiv', { static: false }) mapDiv!: ElementRef;

  constructor(
    private firestore: AngularFirestore,
    private router: Router,
    private placesService: PlacesService,
    private afAuth: AngularFireAuth,
    private mensajes: MensajesService,
    private mapService: MapService,
  ) {
    this.ubicacion = [0, 0];
    this.updateLocation();
  }

  ngOnInit() {
    this.getUserData().then(() => {
      this.getVehiculoData();
    });
  }

  ngAfterViewInit() {
    this.initMap();

    setTimeout(() => {
      if (this.map) {
        this.map.resize();
      }
    }, 200);
  }

  async getUserData() {
    try {
      const usuarioFirebase = await this.afAuth.currentUser;
      if (usuarioFirebase) {
        const user = await this.firestore.collection('usuarios').doc(usuarioFirebase.uid).get().toPromise();
        this.userData = user?.data() as Usuario;
        if (this.userData) {
          console.log('User Data:', this.userData);
        }
      } else {
        throw new Error('Usuario no autenticado');
      }
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
      await this.mensajes.show('Ocurrió un error al obtener tus datos. Intenta de nuevo más tarde.');
    }
  }

  async getVehiculoData() {
    try {
      const usuarioFirebase = await this.afAuth.currentUser;
      if (usuarioFirebase && this.userData && this.userData.rut) {
        const rut = this.userData.rut;
        const vehiculosSnapshot = await this.firestore
          .collection('vehiculos', ref => ref.where('usuarioRUT', '==', rut).where('predeterminado', '==', true))
          .get().toPromise();
  
        if (vehiculosSnapshot && !vehiculosSnapshot.empty) {
          const vehiculoDoc = vehiculosSnapshot.docs[0];
          const vehiculoData = vehiculoDoc.data() as any;
          this.vehiculoData = {
            ...vehiculoData,
            usuarioUID: usuarioFirebase.uid
          };
          console.log('Datos del vehículo predeterminado:', this.vehiculoData);
        } else {
          await this.mensajes.show('No se encontró un vehículo predeterminado asociado a tu cuenta.');
        }
      }
    } catch (error) {
      console.error('Error al obtener los datos del vehículo predeterminado:', error);
      await this.mensajes.show('Ocurrió un error al obtener el vehículo predeterminado. Intenta de nuevo más tarde.');
    }
  }
  
  updateLocation() {
    if (this.placesService.userLocation) {
      this.ubicacion = this.placesService.userLocation;
    }
  }

  async onSubmit() {
    if (this.validateForm()) {
      await this.getUserData();
      await this.getVehiculoData();
  
      const start: [number, number] | undefined = this.mapService.getStartPoint();
      const end: [number, number] | undefined = this.mapService.getEndPoint();
      const routeCoordinates = this.mapService.getRouteCoordinates();
  
      if (!start || !end || !routeCoordinates) {
        await this.mensajes.show('No se puede crear el viaje sin coordenadas válidas de inicio y fin.');
        return;
      }
  
      if (this.userData && this.vehiculoData) {
        const viajeData = {
          uid: this.vehiculoData.usuarioUID,
          rut: this.userData.rut,
          pnombre: this.userData.pnombre,
          papellido: this.userData.papellido,
          patente: this.vehiculoData.patente,
          marca: this.vehiculoData.marca,
          modelo: this.vehiculoData.modelo,
          createdAt: new Date(), // Este será un objeto de fecha, Firebase lo convierte automáticamente a un timestamp
          numAsientos: this.numAsientos?.toString(), // Convertimos a cadena
          precio: this.precio?.toString(), // Convertimos a cadena
          ubicacionInicial: start,
          ubicacionFinal: end,
          viajeFinalizado: false,
          viajeId: '', // Inicialmente vacío, se asignará después,
          viajeConCupo: true
        };
  
        const result = await this.mensajes.mensajeDosBotones(
          'Confirmar viaje',
          '¿Estás seguro de que deseas crear este viaje?',
          'warning',
          'Confirmar',
          'Cancelar'
        );
  
        if (result.isConfirmed) {
          try {
            const docRef = await this.firestore.collection('viajes').add(viajeData);
            this.viajeId = docRef.id; // Almacena el ID del viaje en la variable viajeId
            viajeData.viajeId = this.viajeId; // Asigna el viajeId al objeto viajeData
  
            // Aquí puedes volver a actualizar el viaje en Firebase si es necesario
            await this.firestore.collection('viajes').doc(this.viajeId).update({ viajeId: this.viajeId });
  
            console.log('Viaje creado exitosamente con ID:', this.viajeId);
  
            this.router.navigate(['/resumen-viaje'], {
              state: {
                precio: this.precio,
                numAsientos: this.numAsientos,
                coordenadasRuta: routeCoordinates,
                startCoordinates: start,
                endCoordinates: end,
                viajeId: this.viajeId,
              }
            });
          } catch (error) {
            await this.mensajes.show('Error al crear el viaje. Por favor, inténtalo más tarde.');
            console.error('Error al crear el viaje:', error);
          }
        } else {
          console.log('Viaje cancelado por el usuario.');
        }
      } else {
        await this.mensajes.show('Por favor, asegúrate de que el número de asientos y el precio estén definidos.');
      }
    } else {
      await this.mensajes.show('Por favor, ingresa una capacidad entre 1 y 4 y un precio mínimo de 1000.');
    }
  }  
  
  initMap() {
    if (this.mapDiv && this.mapService.getRouteCoordinates()) {
      mapboxgl.accessToken = 'pk.eyJ1Ijoia2EtcGVyZWlyYSIsImEiOiJjbTI3MWJnYmMxOHF2MmtwdnBiN3ppeHcyIn0.57SuQ82S_HpbP2F5MVbfEA';
      this.coordenadasRuta = this.mapService.getRouteCoordinates()!;
      this.startCoordinates = this.mapService.getStartPoint();
      this.endCoordinates = this.mapService.getEndPoint();

      this.map = new mapboxgl.Map({
        container: this.mapDiv.nativeElement,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: this.coordenadasRuta[0],
        zoom: 14,
      });

      this.map.on('load', () => {
        if (this.map) {
          new mapboxgl.Marker({ color: 'red' })
            .setLngLat(this.startCoordinates!)
            .addTo(this.map);

          new mapboxgl.Marker({ color: 'blue' })
            .setLngLat(this.endCoordinates!)
            .addTo(this.map);

          this.map.addSource('ruta', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: this.coordenadasRuta!,
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

          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend(this.startCoordinates!);
          bounds.extend(this.endCoordinates!);
          this.coordenadasRuta!.forEach(coord => {
            bounds.extend(coord);
          });

          this.map.fitBounds(bounds, {
            padding: 50,
          });
        }
      });
    }
  }

  validateForm(): boolean {
    return this.numAsientos !== undefined && this.precio !== undefined &&
           this.numAsientos >= 1 && this.numAsientos <= 4 &&
           this.precio >= 1000;
  }
}
