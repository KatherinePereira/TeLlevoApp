import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { Vehiculo } from 'src/app/interfaces/vehiculo';
import { VehiculoService } from 'src/app/services/firebase/vehiculo.service';
import { MensajesService } from 'src/app/services/mensajes.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vehiculos',
  templateUrl: './vehiculos.page.html',
  styleUrls: ['./vehiculos.page.scss'],
})
export class VehiculosPage implements OnInit {
  vehiculos: any = []; 

  constructor(
    private menuController: MenuController,
    private router: Router,
    private vehiculoService: VehiculoService,
    private angularFireAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private mensaje: MensajesService
  ) { }

  ngOnInit() {
    this.menuController.enable(true);
    this.config();
  }

  config() {
    this.firestore.collection('vehiculos').snapshotChanges().subscribe(aux => {
      this.vehiculos = aux.map(a => {
        const data = a.payload.doc.data() as any; // Obtenemos los datos del documento
        const uid = a.payload.doc.id; // Obtenemos el ID del documento
        return { uid, ...data }; // Retornamos un nuevo objeto que incluye el uid
      });
    });
  }

  verDetalleVehiculo(vehiculo: Vehiculo) {
    this.router.navigate(['detalle-vehiculos', vehiculo]);
  }

  async eliminarVehiculo(vehiculo: any) {
    const result = await this.mensaje.mensajeDosBotones('Eliminar vehículo', '¿Estás seguro de eliminar el vehículo de la persona?', 'warning', 'Eliminar', 'Cancelar')

    if (result.isConfirmed) {
      try {
        await this.firestore.collection('vehiculos').doc(vehiculo.uid).delete();
        
        this.vehiculos = this.vehiculos.filter((v: Vehiculo) => v.uid !== vehiculo.uid);
        await this.mensaje.mensaje('Eliminado!', 'El vehículo ha sido eliminado exitosamente.', 'success');
      } catch (error) {
        await this.mensaje.mensaje('Error!', 'No se pudo eliminar el vehículo.', 'error');
      }
    }
  }
}
