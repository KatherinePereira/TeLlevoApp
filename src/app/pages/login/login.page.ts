import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, MenuController, AnimationController, createAnimation } from '@ionic/angular';
import { Usuario } from 'src/app/interfaces/usuario';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { MensajesService } from 'src/app/services/mensajes.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import Swal from 'sweetalert2';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  alertButtons = ['Action'];

  loginForm: FormGroup;
  emailValue: string = '';
  passValue: string = '';
  cuentas: any[] = [];
  tipoCuentas: string = 'conductor';

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private usuariosService: UsuariosService,
    private menuController: MenuController,
    private animationCtrl: AnimationController,
    private fireStore: AngularFirestore,
    private mensaje: MensajesService,
    private http: HttpClient
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      pass: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    this.menuController.enable(false);
    this.imgingre();
  }

  async login() {
    try {
      const loading = await this.loadingController.create({
        message: 'Cargando.....',
        duration: 3000,
        spinner: 'bubbles',
      });
  
      const email = this.emailValue;
      const pass = this.passValue;
  
      const usuarioFirebase = await this.authService.login(email as string, pass as string);
  
      if (usuarioFirebase.user) {
        await loading.present();
  
        const user = await this.fireStore.collection('usuarios').doc(usuarioFirebase.user.uid).get().toPromise();
        const userData = user?.data() as Usuario;
  
        if (userData.usuarioDeshabilitado) {
          await loading.dismiss();
          await this.mensaje.mensaje('Usuario Deshabilitado', 'Haz sido deshabilitado por infringir las normas de la app por lo cual tu acceso ha sido denegado.', 'error');
          
          this.emailValue = '';
          this.passValue = '';
          return;
        }
  
        setTimeout(async () => {
          await loading.dismiss();
          
          if (userData.tipo === 'admin') {
            this.router.navigate(['home']);
          } else if (userData.tipo === 'conductor') {
            this.router.navigate(['home2']);
          } else {
            this.router.navigate(['home']);
          }
          
          this.emailValue = '';
          this.passValue = '';
        });
      }
    } catch (error) {
      await this.mensaje.mensaje('Credenciales Incorrectas', 'Por favor, verifique sus credenciales e intente nuevamente.', 'error');
      this.emailValue = '';
      this.passValue = '';
    }
  }  

  imgingre() {
    const btn = createAnimation()
      .addElement(document.querySelectorAll('#imgingre'))
      .fill('none')
      .duration(1000)
      .keyframes([
        { offset: 0, transform: 'scale(1)', opacity: '1' },
        { offset: 0.5, transform: 'scale(0.9)', opacity: '0.7' },
        { offset: 1, transform: 'scale(1)', opacity: '1' },
      ]);
    var animation = createAnimation().duration(2000).iterations(Infinity).addAnimation([btn]);
    animation.play();
  }

  formatRut(rut: string): string {
    const rutClean = rut.replace(/\./g, '').replace('-', '');
    const rutNumber = rutClean.slice(0, -1);
    const verifierDigit = rutClean.slice(-1);

    // Añadir puntos en los miles
    const formattedRut = rutNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${formattedRut}-${verifierDigit}`;
  }

  async crearCuentas() {
    this.cuentas = [];  // Resetear la lista local de cuentas antes de crear nuevas.
    const password = 'aaaaaa';
    
    // Llamar a randomuser.me para obtener 10 usuarios
    try {
      const users: any = await this.http.get('https://randomuser.me/api/?results=10').toPromise();
      
      for (let index = 0; index < users.results.length; index++) {
        const user = users.results[index];
        
        // Extraer los datos necesarios desde randomuser.me
        const pnombre = user.name.first;
        const snombre = user.name.middle || ''; // Algunos usuarios no tienen second name
        const papellido = user.name.last;
        const sapellido = user.name.last; // Usamos el mismo apellido dos veces como ejemplo
        const email = `${pnombre}.${papellido}@${index < 5 ? 'conductor' : 'pasajero'}.cl`.toLowerCase();
        const tipo = index < 5 ? 'conductor' : 'pasajero';
        const rut = this.formatRut(`${Math.floor(Math.random() * 10000000)}-${Math.floor(Math.random() * 10)}`); // Generar un rut aleatorio formateado
        const fechaNacimiento = user.dob.date.split('T')[0]; // Fecha de nacimiento (formato ISO)
        const celular = user.phone.replace(/\D/g, ''); // Remover caracteres no numéricos del número de teléfono
      
        // Crear usuario en Firebase Authentication
        try {
          const userCredential = await this.authService.register(
            email,
            password,
            password,
            pnombre,
            snombre,
            papellido,
            sapellido,
            celular,
            rut,
            fechaNacimiento,
            tipo
          );
    
          const uid = userCredential.user?.uid; // Obtener el UID generado por Firebase Authentication
    
          // Guardar el usuario en Firestore con el UID y todos los demás campos
          await this.fireStore.collection('usuarios').doc(uid).set({
            uid,  // Añadir el UID aquí
            pnombre,
            snombre,
            papellido,
            sapellido,
            email,
            tipo,
            rut,
            fechaNacimiento,
            celular,
            pass: password,
            vehiculoRegistrado: tipo === 'conductor' // Asignar verdadero si es conductor
          });
    
          // Añadir el usuario a la lista local
          this.cuentas.push({ email, password, tipo });
        } catch (error) {
          console.error(`Error creando la cuenta ${email}:`, error);
        }
      }
    
      // Mostrar mensaje de éxito
      Swal.fire({
        title: 'Cuentas creadas',
        text: 'Se han creado 10 cuentas correctamente',
        icon: 'success',
        heightAuto: false
      });
  
    } catch (error) {
      console.error('Error obteniendo los usuarios de randomuser.me:', error);
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al generar las cuentas.',
        icon: 'error',
        heightAuto: false
      });
    }
  }
  
  
  async eliminarCuentas() {
    try {
      for (const cuenta of this.cuentas) {
        // Iniciar sesión con las credenciales de la cuenta para obtener el uid
        const usuarioFirebase = await this.authService.login(cuenta.email, cuenta.password);
        const uid = usuarioFirebase.user?.uid;
    
        if (uid) {
          // Eliminar el documento del usuario en Firestore
          await this.fireStore.collection('usuarios').doc(uid).delete();
    
          // Eliminar el usuario de Firebase Authentication
          await usuarioFirebase.user?.delete();
        }
      }
  
      // Limpiar la lista de cuentas después de eliminar
      this.cuentas = [];
  
      Swal.fire({
        title: 'Cuentas eliminadas',
        text: 'Se han eliminado todas las cuentas',
        icon: 'success',
        heightAuto: false
      });
      
    } catch (error) {
      console.error(`Error eliminando las cuentas:`, error);
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al eliminar las cuentas. Inténtalo nuevamente.',
        icon: 'error',
        heightAuto: false
      });
    }
  }

  async onLoginWithGoogle() {
    try {
      await this.authService.loginWithGoogle();
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    }
  }  

  async onLoginWithGitHub() {
    try {
      await this.authService.loginWithGitHub();
    } catch (error) {
      console.error('Error al iniciar sesión con GitHub:', error);
    }
  }
}