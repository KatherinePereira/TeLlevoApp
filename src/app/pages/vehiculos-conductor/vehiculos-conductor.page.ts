import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import Swal from 'sweetalert2';
import { MensajesService } from 'src/app/services/mensajes.service';

@Component({
  selector: 'app-vehiculos-conductor',
  templateUrl: './vehiculos-conductor.page.html',
  styleUrls: ['./vehiculos-conductor.page.scss'],
})
export class VehiculosConductorPage implements OnInit {
  vehiculos: any[] = [];

  constructor(
    private menuController: MenuController,
    private router: Router,
    private firestore: AngularFirestore,
    private angularFireAuth: AngularFireAuth,
    private mensaje: MensajesService
  ) { }

  ngOnInit() {
    this.menuController.enable(true);
    this.obtenerVehiculosDelConductor();
  }

  obtenerVehiculosDelConductor() {
    this.angularFireAuth.authState.subscribe(user => {
      if (user) {
        this.firestore.collection('vehiculos', ref => 
          ref.where('usuarioUID', '==', user.uid)
        )
        .snapshotChanges()
        .subscribe(vehiculosSnapshot => {
          this.vehiculos = vehiculosSnapshot.map(vehiculo => {
            const data = vehiculo.payload.doc.data() as any;
            const uid = vehiculo.payload.doc.id;
            return { uid, ...data };
          });
  
          // Si hay un solo vehículo, marcarlo como predeterminado
          if (this.vehiculos.length === 1) {
            this.vehiculos[0].predeterminado = true;
          }
  
          this.actuTipoUser(user.uid);
        });
      }
    });
  }  

  async actuTipoUser(uid: string) {
    const usuarioRef = this.firestore.collection('usuarios').doc(uid);
    const usuarioDoc = await usuarioRef.get().toPromise();
  
    if (usuarioDoc && usuarioDoc.exists) {
      const usuarioData = usuarioDoc.data() as any;
  
      if (this.vehiculos.length === 0 && usuarioData.tipo === 'conductor') {
        await usuarioRef.update({ tipo: 'pasajero' , vehiculoRegistrado: false });
      }
    }
  }

  verDetalleVehiculo(vehiculo: any) {
    this.router.navigate(['detalle-vehiculos', vehiculo]);
  }

  async eliminarVehiculo(vehiculo: any) {
    const esUltimoVehiculo = this.vehiculos.length === 1;
    const result = await this.mensaje.mensajeDosBotones('¿Estás seguro de eliminar tu vehículo?', 'No podrás recuperar la información del vehículo y deberás agregarlo nuevamente.' + (esUltimoVehiculo ? ' Si eliminas este vehículo, volverás a ser pasajero, por el cual se te desconectará y deberás iniciar sesión nuevamente para ver los cambios efectuados.' : ''), 'warning', 'Eliminar', 'Cancelar');
  
    if (result.isConfirmed) {
      await this.firestore.collection('vehiculos').doc(vehiculo.uid).delete()
        .then(() => {
          this.mensaje.mensaje('Eliminado', 'El vehículo ha sido eliminado exitosamente.', 'success').then(async() => {
            this.vehiculos = this.vehiculos.filter(v => v.uid !== vehiculo.uid);
            this.actuTipoUser(vehiculo.usuarioUID);
  
            if (esUltimoVehiculo) {
              await this.angularFireAuth.signOut();
              await this.router.navigate(['/login']);
              await this.mensaje.mensaje('¡Sesión cerrada!', 'Has sido desconectado.', 'info');
            }
          });
        })
        .catch(error => {
          this.mensaje.mensaje('Error!', 'No se pudo eliminar el vehículo.', 'error');
        });
    }
  }  

  async marcarComoPredeterminado(vehiculo: any) {
    try {
      const usuarioFirebase = await this.angularFireAuth.currentUser;
  
      if (usuarioFirebase) {
        const batch = this.firestore.firestore.batch();
  
        const vehiculosRef = this.firestore.collection('vehiculos', ref => 
          ref.where('usuarioUID', '==', usuarioFirebase.uid)
        );
  
        const vehiculosSnapshot = await vehiculosRef.get().toPromise();
  
        // Si hay solo un vehículo, no permitir que cambie la predeterminación
        if (vehiculosSnapshot && vehiculosSnapshot.size <= 1) {
          this.mensaje.mensaje('Error', 'Debes tener al menos dos vehículos para cambiar el predeterminado.', 'error');
          return;
        }
  
        vehiculosSnapshot?.docs.forEach(doc => {
          const isCurrentVehicle = doc.id === vehiculo.uid;
          batch.update(doc.ref, { predeterminado: isCurrentVehicle });
        });
  
        await batch.commit();
        this.mensaje.mensaje('Éxito', 'El vehículo ha sido marcado como predeterminado.', 'success');
      } else {
        this.mensaje.mensaje('Error', 'No se pudo obtener el usuario autenticado.', 'error');
      }
    } catch (error) {
      this.mensaje.mensaje('Error', 'Error al marcar como predeterminado.', 'error');
      console.error('Error al marcar como predeterminado:', error);
    }
  }  
}  