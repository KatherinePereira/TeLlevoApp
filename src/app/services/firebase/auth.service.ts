import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, Subscription } from 'rxjs';
import { Usuario } from 'src/app/interfaces/usuario';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import { MensajesService } from '../mensajes.service';
import { Viaje } from '../viajes.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private deshabilitadoSubscription: Subscription | null = null;

  constructor(private angularFireAuth: AngularFireAuth, private firestore: AngularFirestore, private router: Router, private mensaje: MensajesService) { }
  login (email: string, pass: string){
    return this.angularFireAuth.signInWithEmailAndPassword(email,pass);
  }

  isLogged(): Observable<any>{
    return this.angularFireAuth.authState;
  }

  register (email: string, pass: string, pass2: string, pnombre: string, snombre: string, papellido: string, sapellido: string, celular: string, rut: string, fechaNacimiento: string, tipo: string){
    return this.angularFireAuth.createUserWithEmailAndPassword(email,pass);
  }

  logout (){
    return this.angularFireAuth.signOut();
  }

  recuperarContrasenia(email: string){
    return this.angularFireAuth.sendPasswordResetEmail(email)
    .then(() => {
      console.log('Correo enviado!');
    })
    .catch((error)=>{
      console.log('Error al enviar correo de recuperación');
      throw error;
    })
  }

  async getTipoUsuario(uid: string): Promise<string | null> {
    const usuarioDoc = await this.firestore.collection('usuarios').doc(uid).get().toPromise();
  
    if (!usuarioDoc || !usuarioDoc.exists) {
      return null; // Retorna null si el documento no existe
    }
  
    const usuarioData = usuarioDoc.data() as Usuario;
    return usuarioData && 'tipo' in usuarioData ? usuarioData.tipo : null;
  }

  getUsuario(uid: string): Observable<any> {
    return this.firestore.collection('usuarios').doc(uid).valueChanges();
  }

  
  
  // Nueva función para iniciar sesión con Google
  async loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await this.angularFireAuth.signInWithPopup(provider);
    const user = result.user;
  
    if (user) {
      // Comprobar si el usuario ya está registrado en Firestore
      const usuarioDoc = await this.firestore.collection('usuarios').doc(user.uid).get().toPromise();
  
      if (!usuarioDoc || !usuarioDoc.exists) {
        // Si no está registrado, elimina la cuenta de autenticación
        await this.angularFireAuth.currentUser.then(currentUser => {
          if (currentUser) {
            return currentUser.delete();
          }
          return Promise.resolve(); // Ensure a value is returned in all code paths
        });
  
        // Redirigir a la página de registro con el email
        this.router.navigate(['/registrarse'], { queryParams: { email: user.email } });
      } else {
        // Obtener el tipo de usuario
        const tipoUsuario = await this.getTipoUsuario(user.uid);
  
        // Redirigir según el tipo de usuario
        if (tipoUsuario === 'pasajero') {
          this.router.navigate(['/home']); // Redirigir al home de pasajeros
        } else if (tipoUsuario === 'conductor') {
          this.router.navigate(['/home2']); // Redirigir al home de conductores
        } else {
          this.router.navigate(['/home']); // Redirigir a home por defecto
        }
      }
    }
  }

  async loginWithGitHub() {
  const provider = new firebase.auth.GithubAuthProvider();
  const result = await this.angularFireAuth.signInWithPopup(provider);
  const user = result.user;

  if (user) {
    // Comprobar si el usuario ya está registrado en Firestore
    const usuarioDoc = await this.firestore.collection('usuarios').doc(user.uid).get().toPromise();

    if (!usuarioDoc || !usuarioDoc.exists) {
      // Si no está registrado, elimina la cuenta de autenticación
      await this.angularFireAuth.currentUser.then(currentUser => {
        if (currentUser) {
          return currentUser.delete();
        }
        return Promise.resolve(); // Asegúrate de que se devuelve un valor en todos los caminos de código
      });

      // Redirigir a la página de registro con el email
      this.router.navigate(['/registrarse'], { queryParams: { email: user.email } });
    } else {
      // Obtener el tipo de usuario
      const tipoUsuario = await this.getTipoUsuario(user.uid);

      // Redirigir según el tipo de usuario
      if (tipoUsuario === 'pasajero') {
        this.router.navigate(['/home']); // Redirigir al home de pasajeros
      } else if (tipoUsuario === 'conductor') {
        this.router.navigate(['/home2']); // Redirigir al home de conductores
      } else {
        this.router.navigate(['/home']); // Redirigir a home por defecto
      }
    }
  }
}


  monitorUsuarioDeshabilitado() {
    this.angularFireAuth.authState.subscribe(user => {
      if (user) {
        const userDocRef = this.firestore.collection('usuarios').doc(user.uid);
        
        // Guardar la suscripción
        this.deshabilitadoSubscription = userDocRef.valueChanges().subscribe((usuario: any) => {
          if (usuario && usuario.usuarioDeshabilitado) {
            this.cerrarSesionForzada();
          }
        });
      }
    });
  }

  async cerrarSesionForzada() {
    const user = await this.angularFireAuth.currentUser;
    if (user) {
      const uid = user.uid;
  
      try {
        // Verificar si hay un viaje activo
        const viajeQuery = await this.firestore.collection('viajes', ref =>
          ref.where('uid', '==', uid).where('viajeFinalizado', '==', false)
        ).get().toPromise();
  
        if (viajeQuery && !viajeQuery.empty) {
          const batch = this.firestore.firestore.batch(); // Crear un batch para realizar varias operaciones en Firestore
  
          // Procesar cada viaje
          for (const viajeDoc of viajeQuery.docs) {
            const viajeRef = viajeDoc.ref; // Obtener la referencia del viaje
            const viajeData = viajeDoc.data() as Viaje; // Obtener los datos del viaje
  
            // Comprobar si el viaje está terminado
            if (viajeData.viajeFinalizado) {
              // Mover el viaje a la colección 'viajesCompletados'
              const completedViajeRef = this.firestore.collection('viajesCompletados').doc(viajeDoc.id); // Referencia para el nuevo documento
              batch.set(completedViajeRef.ref, {
                ...viajeData, // Copiar todos los datos del viaje
                viajeFinalizado: true // Asegurarse de que el viaje esté marcado como finalizado
              });
              console.log('Viaje copiado a viajesCompletados');
            } else {
              // Si no está terminado, simplemente finalizarlo
              batch.update(viajeRef, { viajeFinalizado: true });
            }
          }
  
          await batch.commit(); // Ejecutar el batch para actualizar los viajes
          console.log('Viajes finalizados exitosamente');
        } else {
          console.log('No hay viajes activos para finalizar');
        }
  
        // Desconectar al usuario
        await this.angularFireAuth.signOut();
        this.router.navigate(['login']);
        this.showDisabledMessage();
  
      } catch (error) {
        console.error('Error al finalizar el viaje:', error);
      } finally {
        // Cancelar la suscripción para detener el monitoreo
        if (this.deshabilitadoSubscription) {
          this.deshabilitadoSubscription.unsubscribe();
          this.deshabilitadoSubscription = null;
        }
      }
    }
  }
  
  
  async showDisabledMessage() {
    await this.mensaje.mensaje(
      'Usuario Deshabilitado',
      'Haz sido deshabilitado por infringir las normas de la app por lo cual tu acceso ha sido denegado.',
      'error'
    );
  }
}