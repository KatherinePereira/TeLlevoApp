import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UbicacionesService {
  private ubicacionActualSubject = new BehaviorSubject<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  ubicacionActual$ = this.ubicacionActualSubject.asObservable();

  public esConductorActivoSubject = new BehaviorSubject<boolean>(false);
  esConductorActivo$ = this.esConductorActivoSubject.asObservable();
  
  private userLocationSubject = new BehaviorSubject<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  userLocation$ = this.userLocationSubject.asObservable();

  constructor( private firestore: AngularFirestore) {}

  escucharUbicacion(viajeId: string) {
    this.firestore.collection('viajes').doc(viajeId).valueChanges().subscribe((viaje: any) => {
      if (viaje && viaje.ubicacionActual) {
        console.log('Ubicación actualizada desde Firebase:', viaje.ubicacionActual);
        this.ubicacionActualSubject.next(viaje.ubicacionActual);
      } else {
        console.log('No se recibió ubicación actualizada desde Firebase.');
      }
    });
  }

  actualizarUbicacion(viajeId: string, lat: number, lng: number) {
    return this.firestore.collection('viajes').doc(viajeId).update({
      ubicacionActual: { lat, lng }
    });
  }  

  setConductorActivo(estado: boolean) {
    this.esConductorActivoSubject.next(estado);
  }

  actualizarUbicacionUsuario(lat: number, lng: number) {
    this.userLocationSubject.next({ lat, lng });
  }
}
