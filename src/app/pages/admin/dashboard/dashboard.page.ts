import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { Usuario } from 'src/app/interfaces/usuario';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { MensajesService } from 'src/app/services/mensajes.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  usuarios: any = []; 

  constructor(private menuController: MenuController, private usuariosService: UsuariosService, private router: Router, private authServices: AuthService, private angularFireAuth: AngularFireAuth, private firestore: AngularFirestore, private mensaje: MensajesService) { }

  ngOnInit() {
    this.menuController.enable(true);
    this.config();
  }

  config(){
    this.firestore.collection('usuarios').valueChanges().subscribe(aux => {
      this.usuarios = aux;
    });
  }

  verDetalleUsuarios(usuario: Usuario){
    this.router.navigate(['detalles-usuarios', usuario]);
  }

  editarUser(uid: string){
    this.router.navigate(['/edit-user', uid]);
  }

  logout(){
    this.authServices.logout();
    this.router.navigate(['login']);
  }

  deshabilitarUsuario(uid: string): boolean {
    const userDocRef = this.firestore.collection('usuarios').doc(uid);
    const aux = this.usuarios.find((usuario: any) => usuario.uid === uid);

    if (userDocRef && aux) {
      this.mensaje.mensajeDosBotones('¿Estás seguro?', 'Esta acción deshabilitará al usuario y no podrá ingresar a la app.', 'warning', 'Sí, deshabilitar', 'Cancelar')
      .then((result) => {
        if (result.isConfirmed) {
          aux.usuarioDeshabilitado = true;
          userDocRef.update({ usuarioDeshabilitado: true })
          .then(() => {
            this.mensaje.mensaje('Usuario deshabilitado', 'El usuario ha sido deshabilitado exitosamente.', 'success');
          })
          .catch(error => {
            console.error('Error al deshabilitar el usuario:', error);
            this.mensaje.mensaje('Error!', 'Hubo un problema al deshabilitar el usuario.', 'error');
          });
        }
      });
      return true;
    }
    return false;
  }

  
  habilitarUsuario(uid: string): boolean {
    const userDocRef = this.firestore.collection('usuarios').doc(uid);
    const aux = this.usuarios.find((usuario: any) => usuario.uid === uid);

    if (userDocRef && aux) {
      this.mensaje.mensajeDosBotones('¿Estás seguro?', 'Esta acción habilitará al usuario y podrá ingresar a la app nuevamente.', 'warning', 'Sí, habilitar', 'Cancelar')
      .then((result) => {
        if (result.isConfirmed) {
          aux.usuarioDeshabilitado = false;
          userDocRef.update({ usuarioDeshabilitado: false })
          .then(() => {
            this.mensaje.mensaje('Usuario habilitado', 'El usuario ha sido habilitado exitosamente.', 'success');
          })
          .catch(error => {
            console.error('Error al habilitar el usuario:', error);
            this.mensaje.mensaje('Error!', 'Hubo un problema al habilitar el usuario.', 'error');
          });
        }
      });
      return true;
    }
    return false;
  }
}
