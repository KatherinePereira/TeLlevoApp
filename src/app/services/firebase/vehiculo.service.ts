import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {

  constructor(private fireStore: AngularFirestore) { }

  registerVehiculo(marca: string, modelo: string, patente: string, color: string, asientos: string, anio: string, tipo: string) {
    return this.fireStore.collection('vehiculos').add({
      marca: marca,
      modelo: modelo,
      patente: patente,
      color: color,
      asientos: asientos,
      anio: anio,
      tipo: tipo
    });
  }

  obtenerVehiculos() {
    return this.fireStore.collection('vehiculos').valueChanges();
  }
}
