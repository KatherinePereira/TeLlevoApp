import { Injectable } from '@angular/core';
import { Vehiculo } from '../interfaces/vehiculo';

@Injectable({
  providedIn: 'root'
})
export class VehiculosService {

  vehiculos: Vehiculo[] =[
    { marca: '', modelo: '', patente: '', color: '', asientos: '', anio: '', tipo: '', uid: '', rut : '', pnombre: '', papellido: '' },
  ]

  constructor() { }

  getVehiculos(): Vehiculo[]{ 
    return this.vehiculos;
  }

  addVehiculo(vehiculo: Vehiculo){
    this.vehiculos.push(vehiculo);
  }

  deleteVehiculo(){
    
  }

  updateVehiculo(){

  }
}
