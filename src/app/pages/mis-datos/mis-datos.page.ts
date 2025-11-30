import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { Usuario } from 'src/app/interfaces/usuario';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { MensajesService } from 'src/app/services/mensajes.service';

@Component({
  selector: 'app-mis-datos',
  templateUrl: './mis-datos.page.html',
  styleUrls: ['./mis-datos.page.scss'],
})
export class MisDatosPage implements OnInit {

  userUID: string = '';
  userData: any;
  formatFechaNacimiento: string = '';

  constructor(private authService: AuthService, private fireStore: AngularFirestore, private router: Router, private mensaje: MensajesService) { }

  ngOnInit() {
    this.loadData();
  }

  loadData(){
    this.authService.isLogged().subscribe(async(user)=>{
      if(user){
        this.userUID = user.uid;
        const userDoc = await this.fireStore.collection('usuarios').doc(this.userUID).get().toPromise();

        this.userData = userDoc?.data() as Usuario;
        if (this.userData && this.userData.fechaNacimiento) {
          this.formatFechaNacimiento = this.formatFechaNac(this.userData.fechaNacimiento);
        }
      }
    });
  }
  
  validarCelular() {
    if (!this.userData.celular || this.userData.celular.toString().length !== 9) {
      /* console.log('El número de teléfono debe tener 9 dígitos'); */
    }
  }

  formatFechaNac(fecha: string): string {
    const [year, month, day] = fecha.split('-');
    return `${day}-${month}-${year}`;
  }

  async actualizarUser() {
    if (this.userUID && this.userData) {
      // Obtener el número actual del usuario desde la base de datos
      const usuarioDoc = await this.fireStore.collection('usuarios').doc(this.userUID).get().toPromise();
      const datosUsuario = usuarioDoc?.data() as Usuario;
      
      const numeroActual = datosUsuario?.celular;
      const nuevoNumero = this.userData.celular;

      if (numeroActual === nuevoNumero) {
        this.mensaje.mensaje('Número repetido!', 'El número de celular ingresado es el mismo que el actual. Por favor, ingresa un número diferente.', 'warning');
        return;
      }
  
      await this.fireStore.collection('usuarios').doc(this.userUID).update(this.userData).then(() => {
        this.mensaje.mensaje('Hecho!', 'Se ha actualizado tu número telefónico!', 'success');
      }).catch(error => {
        this.mensaje.mensaje('Error!', 'No se ha actualizado tu número telefónico.', 'error');
      });
    }  
  }
  
}
