import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {  map, Observable, Subject, tap } from 'rxjs';

export interface Viaje {
    createdAt: Date;
    marca: string;
    modelo: string;
    numAsientos: number;
    papellido: string;
    patente: string;
    pnombre: string;
    precio: number;
    rut: string;
    ubicacionFinal: number[];
    ubicacionInicial: number[];
    uid: string;
    viajeFinalizado: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ViajesService {

    constructor(private firestore: AngularFirestore) { }

    public viajeSubject = new Subject<Viaje | null>();

    async finalizarViaje(viajeId: string): Promise<void> {
        const viajeRef = this.firestore.collection('viajes').doc(viajeId);
        const viajeData = await viajeRef.get().toPromise();

        if (viajeData && viajeData.exists) {
            const viaje = viajeData.data() as Viaje;

            await viajeRef.update({ viajeFinalizado: true });
            console.log('Viaje finalizado exitosamente');

            await this.firestore.collection('viajesCompletados').add({
                ...viaje,
                viajeFinalizado: true
            });
            console.log('Viaje copiado a viajesCompletados');

            await viajeRef.delete();
            console.log('Viaje eliminado de la colección viajes', viaje);
        } else {
            console.error('El viaje no existe o no se pudo recuperar');
        }
    }

    obtenerViajes(): Observable<Viaje[]> {
      return this.firestore.collection<Viaje>('viajes', ref => ref.where('viajeConCupo', '==', true)).snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Viaje;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      );
    }    

    obtenerViajePorId(viajeId: string): Observable<Viaje | null> {
      return this.firestore.collection<Viaje>('viajes').doc(viajeId).valueChanges().pipe(
          map((viaje) => viaje ?? null),
          tap((viaje) => this.viajeSubject.next(viaje))
      );
    }

    obtenerViajePorPatente(patente: string): Observable<Viaje | null> {
      return this.firestore.collection<Viaje>('viajes', ref => ref.where('patente', '==', patente)).valueChanges().pipe(
          map((viajes: Viaje[]) => {
              if (viajes.length > 0) {
                  console.log('Viaje encontrado:', viajes[0]); // Verificar el viaje encontrado
                  return viajes[0];
              } else {
                  return null;
              }
          })
      );
  }  

  async actualizarCapacidadViaje(viajeId: string, nuevaCapacidad: number): Promise<void> {
    const viajeRef = this.firestore.collection('viajes').doc(viajeId);

    try {

        await viajeRef.update({ numAsientos: nuevaCapacidad });
        console.log('Capacidad actualizada con éxito');

        // Recupera el documento
        const doc = await viajeRef.get().toPromise();
        
        // Verifica si el documento existe y procede
        if (doc?.exists) {
            const viaje = doc.data() as Viaje;

            if (nuevaCapacidad === 0) {
                await viajeRef.update({ viajeConCupo: false });
            } else if (viaje.numAsientos > 0) {
                await viajeRef.update({ viajeConCupo: true });
            }

            this.viajeSubject.next(viaje);
        } else {
            console.error('El viaje no existe o no se pudo recuperar');
        }
    } catch (error) {
        console.error('Error al actualizar la capacidad del viaje:', error);
        throw new Error('Error desconocido al actualizar el documento.');
    }
  }

  actualizarViajeConCupo(viajeId: string, viajeConCupo: boolean) {
    const viajeRef = this.firestore.collection('viajes').doc(viajeId);
    
    return viajeRef.update({ viajeConCupo: viajeConCupo })
        .then(() => {
            console.log('Estado de viajeConCupo actualizado con éxito');
        })
        .catch((error) => {
            console.error('Error al actualizar el estado de viajeConCupo:', error);
            return Promise.reject('Error desconocido al actualizar el documento.');
        });
  }

}
