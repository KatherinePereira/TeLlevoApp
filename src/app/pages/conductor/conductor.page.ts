import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Usuario } from 'src/app/interfaces/usuario';
import { VehiculoService } from 'src/app/services/firebase/vehiculo.service';
import { MensajesService } from 'src/app/services/mensajes.service';

@Component({
  selector: 'app-conductor',
  templateUrl: './conductor.page.html',
  styleUrls: ['./conductor.page.scss'],
})
export class ConductorPage implements OnInit {
  alertButtons = ['Action'];
  vehiculoForm: FormGroup;
  marcaValue: string = '';
  modeloValue: string = '';
  patenteValue: string = '';
  colorValue: string = '';
  asientosValue: string = '';
  anioValue: string = '';
  tipoValue: string = ''; 
  userData: Usuario | undefined;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private vehiculoService: VehiculoService,
    private fireStore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private mensajes: MensajesService
  ) {
    this.vehiculoForm = this.formBuilder.group({
      marca: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-z]+$/)]],
      modelo: ['', [Validators.required, Validators.minLength(2)]],
      patente: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}-\d{2}-[A-Z]{2}$|^[A-Z]{2}-[A-Z]{2}-\d{2}$/)]],
      color: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-z]+$/)]],
      asientos: ['', [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1), Validators.max(4)]],
      anio: ['', [Validators.required, Validators.pattern(/^\d{4}$/), Validators.min(1960), Validators.max(new Date().getFullYear())]],
      tipo: ['', [Validators.required]]
    });

    const campos = ['marca', 'modelo', 'color', 'tipo'];
    campos.forEach(campo => {
      const control = this.vehiculoForm.get(campo);
      if (control) {
        control.valueChanges.subscribe(() => {
          this.primeraletramayusc(control);
        });
      }
    });

    const patenteControl = this.vehiculoForm.get('patente');
    if (patenteControl) {
      patenteControl.valueChanges.subscribe((value: string) => {
        const upperCaseValue = value.toUpperCase();
        patenteControl.setValue(upperCaseValue, { emitEvent: false });
      });
    }
  }

  ngOnInit() {
    this.getUserData();
  }

  async getUserData() {
    try {
      const usuarioFirebase = await this.afAuth.currentUser;

      if (usuarioFirebase) {
        const user = await this.fireStore.collection('usuarios').doc(usuarioFirebase.uid).get().toPromise();
        this.userData = user?.data() as Usuario;

        if (this.userData) {
          console.log('User Data:', this.userData);
        }
      }
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
    }
  }

  async registrarVehiculo() {
    const loading = await this.loadingController.create({
      message: 'Cargando.....',
      duration: 3000,
      spinner: 'bubbles'
    });
  
    try {
      await loading.present();
  
      const usuarioFirebase = await this.afAuth.currentUser;
  
      if (usuarioFirebase) {
        // Verificar si la patente ya está registrada
        const vehiculosSnapshot = await this.fireStore
          .collection('vehiculos', ref => ref.where('patente', '==', this.patenteValue))
          .get()
          .toPromise();
  
        if (vehiculosSnapshot && !vehiculosSnapshot.empty) {
          await loading.dismiss();
          this.mensajes.mensaje('Error', 'Ya existe un vehículo con esta patente.', 'error');
          return; // Detener el proceso si la patente ya está registrada
        }
  
        const userDoc = await this.fireStore.collection('usuarios').doc(usuarioFirebase.uid).get().toPromise();
        const userData = userDoc?.data() as Usuario;
        const esPrimeraVez = !userData.vehiculoRegistrado;
  
        const vehiculoFirebase = await this.vehiculoService.registerVehiculo(
          this.marcaValue,
          this.modeloValue,
          this.patenteValue,
          this.colorValue,
          this.asientosValue,
          this.anioValue,
          this.tipoValue
        );
  
        if (vehiculoFirebase) {
          const predeterminado = esPrimeraVez;
          await this.fireStore.collection('vehiculos').doc(vehiculoFirebase.id).set({
            marca: this.marcaValue,
            modelo: this.modeloValue,
            patente: this.patenteValue,
            color: this.colorValue,
            asientos: this.asientosValue,
            anio: this.anioValue,
            tipo: this.tipoValue,
            usuarioUID: usuarioFirebase.uid,
            usuarioRUT: this.userData?.rut || '',
            usuarioNombre: this.userData?.pnombre || '',
            usuarioApellido: this.userData?.papellido || '',
            predeterminado: predeterminado
          });
  
          this.mensajes.mensaje('Éxito!', 'Vehículo agregado correctamente!', 'success').then(() => {
            this.fireStore.collection('usuarios').doc(usuarioFirebase.uid).update({
              tipo: this.userData?.tipo === 'admin' ? 'admin' : 'conductor',
              vehiculoRegistrado: true 
            });
  
            this.router.navigate(['/home2']).then(() => {
              if (esPrimeraVez) {
                this.mensajes.mensaje('Ya puedes comenzar!', 'Se ha actualizado tu perfil, por favor vuelve a iniciar sesión.', 'success').then(async () => {
                  await this.afAuth.signOut();
                  await this.router.navigate(['/login']);
                  await this.mensajes.mensaje('¡Sesión cerrada!', 'Has sido desconectado.', 'info');
                });
              }
            });
          });
        }
      } else {
        this.mensajes.mensaje('Error!', 'No se pudo obtener el usuario autenticado.', 'error');
      }
    } catch (error) {
      this.mensajes.mensaje('Error!', 'Error en registrar el vehículo, inténtelo nuevamente!', 'error');
      console.error('Error en registrar el vehículo:', error);
    } finally {
      await loading.dismiss();
    }
  }
  

  primeraletramayusc(control: AbstractControl) {
    const value = control.value;
    if (value && typeof value === 'string') {
      const formattedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      control.setValue(formattedValue, { emitEvent: false });
    }
  }
}
