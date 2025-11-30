import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Viaje, ViajesService } from 'src/app/services/viajes.service';

@Component({
  selector: 'app-pasajero',
  templateUrl: './pasajero.page.html',
  styleUrls: ['./pasajero.page.scss'],
})
export class PasajeroPage implements OnInit {
  viajes: Observable<Viaje[]>;
  patente: string = ''; 

  constructor(private viajeService: ViajesService, private router: Router) {
    this.viajes = this.viajeService.obtenerViajes(); // Ahora solo obtiene viajes con viajeConCupo == true
  }

  selectViaje(patenteSeleccionada: string) {
    console.log('Patente seleccionada:', patenteSeleccionada);
    this.patente = patenteSeleccionada;
    this.navigateToViaje(); 
  }
  
  ngOnInit() {
    this.viajes.subscribe(data => {
      console.log(data);
    });
  }

  navigateToViaje() {
    console.log('Navegando a viaje con patente:', this.patente);
    if (this.patente) {
      this.router.navigate(['/viaje', this.patente]).then(success => {
        console.log('Navegación exitosa:', success);
      }).catch(err => {
        console.error('Error en la navegación:', err);
      });      
    } else {
      console.error('Patente no definida');
    }
  }
}
