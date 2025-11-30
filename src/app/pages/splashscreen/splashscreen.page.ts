import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/interfaces/usuario';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { NativeBiometric } from 'capacitor-native-biometric';
import { MensajesService } from 'src/app/services/mensajes.service';

@Component({
  selector: 'app-splashscreen',
  templateUrl: './splashscreen.page.html',
  styleUrls: ['./splashscreen.page.scss'],
})
export class SplashscreenPage implements OnInit {

  constructor(private router: Router,
    private authServices: AuthService,
    private firestore: AngularFirestore,
    private mensaje: MensajesService) { }

  ngOnInit() {
    setTimeout(() => {
      this.checkLogin();
    }, 2500);
  }

  async checkLogin() {
    this.authServices.isLogged().subscribe(async (user) => {
      if (user) {
        try {
          const usuario = await this.firestore.collection('usuarios').doc(user.uid).get().toPromise();
          const userdata = usuario?.data() as Usuario;

          if (userdata) {
            if (userdata.usuarioDeshabilitado) {
              await this.showDisabledMessage();
              this.router.navigate(['login']);
              return;
            }

            await this.checkHuellaDigital();

            if (userdata.tipo === 'admin') {
              this.router.navigate(['admin/dashboard']);
            } else if (userdata.tipo === 'conductor') {
              this.router.navigate(['home2']);
            } else {
              this.router.navigate(['home']);
            }
          }
        } catch (error) {
          this.router.navigate(['login']);
        }
      } else {
        this.router.navigate(['login']);
      }
    });
  }

  async checkHuellaDigital() {
    try {
      await NativeBiometric.verifyIdentity({
        reason: 'Por favor autentifiquese para continuar',
        title: 'Autenticación Biometrica',
        subtitle: 'Usa tu Huella Digital o Face ID',
        description: 'Coloca tu huella en el sensor para ingresar'
      });
    } catch (error) {
      throw error;
    }
  }

  async showDisabledMessage() {
    await this.mensaje.mensaje('Usuario Deshabilitado', 'Haz sido deshabilitado por infringir las normas de la app por lo cual tu acceso ha sido denegado.', 'error');
  }
}
