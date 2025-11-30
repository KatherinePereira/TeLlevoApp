import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VehiculoService } from 'src/app/services/firebase/vehiculo.service';
import { VehiculosService } from 'src/app/services/vehiculos.service';

@Component({
  selector: 'app-detalle-vehiculos',
  templateUrl: './detalle-vehiculos.page.html',
  styleUrls: ['./detalle-vehiculos.page.scss'],
})
export class DetalleVehiculosPage implements OnInit {

  uid?: string | null;
  rut?: string | null;
  pnombre?: string | null;
  papellido?: string | null;
  marca?: string | null;
  modelo?: string | null;
  patente?: string | null;
  color?: string | null;
  asientos?: string | null;
  anio?: string | null;
  tipo?: string | null;

  constructor(private activatedRoute: ActivatedRoute, private vehiculoServices: VehiculoService) { }

  ngOnInit() {
    this.patente = this.activatedRoute.snapshot.paramMap.get('patente') || '';
    console.log(this.activatedRoute.snapshot.paramMap.get('tipo'));
    this.vehiculoServices.obtenerVehiculos().subscribe((vehiculos: any[]) => {
    const detvehiculo = vehiculos.find((vehiculo: any) => vehiculo.patente === this.patente);

      if(detvehiculo){
        this.uid = detvehiculo.usuarioUID;
        this.rut = detvehiculo.usuarioRUT;
        this.pnombre = detvehiculo.usuarioNombre;
        this.papellido = detvehiculo.usuarioApellido;
        this.marca = detvehiculo.marca;
        this.modelo = detvehiculo.modelo;
        this.patente = detvehiculo.patente;
        this.color = detvehiculo.color;
        this.asientos = detvehiculo.asientos;
        this.anio = detvehiculo.anio;
        this.tipo = detvehiculo.tipo;
        console.log(detvehiculo);
      }
    });
  }
}
