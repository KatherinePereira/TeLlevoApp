import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { MapService } from '../../services';

@Component({
  selector: 'app-btn-confirmar-ruta',
  templateUrl: './btn-confirmar-ruta.component.html',
  styleUrls: ['./btn-confirmar-ruta.component.scss'],
})
export class BtnConfirmarRutaComponent {
  @Output() routeConfirmed = new EventEmitter<void>();

  constructor(public mapService: MapService, private router: Router) { }

  confirmRoute() {
    if (!this.mapService.isRouteGenerated) {
      console.error('No hay ruta generada para confirmar.');
      return; // No hace nada si no hay ruta generada
    }

    const start: [number, number] = this.mapService.getStartPoint()!;
    const end: [number, number] = this.mapService.getEndPoint()!;

    if (start && end) {
      this.mapService.storeRoute(start, end); // Almacena la ruta en Firestore
  
      this.routeConfirmed.emit();
      this.router.navigate(['/crear-viaje']);
    } else {
      console.error('No hay puntos de inicio o fin para la ruta.');
    }
  }
}
