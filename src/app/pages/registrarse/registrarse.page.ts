import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'; // Asegúrate de importar ActivatedRoute
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MensajesService } from 'src/app/services/mensajes.service';

@Component({
  selector: 'app-registrarse',
  templateUrl: './registrarse.page.html',
  styleUrls: ['./registrarse.page.scss'],
})
export class RegistrarsePage implements OnInit {
  alertButtons = ['Action'];
  registerForm: FormGroup;
  rutValue: string = '';
  fechaNacimientoValue: string = '';
  pnombreValue: string = '';
  snombreValue: string = '';
  papellidoValue: string = '';
  sapellidoValue: string = '';
  celularValue: string = '';
  emailValue: string = ''; // Este valor se llenará con el email de queryParams
  passValue: string = '';
  pass2Value: string = '';
  tipoValue: string = '';
  usuarioDeshabilitado: boolean = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute, // Agregar ActivatedRoute
    private alertController: AlertController,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private usuariosService: UsuariosService,
    private authService: AuthService,
    private fireStore: AngularFirestore,
    private mensaje: MensajesService
  ) {
    this.registerForm = this.formBuilder.group({
      rut: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(12), rutValidator]],
      fechaNacimiento: ['', [Validators.required, this.mayorDeEdadValidator]],
      pnombre: ['', [Validators.required, Validators.minLength(2)]],
      snombre: ['', [Validators.minLength(2)]],
      papellido: ['', [Validators.required, Validators.minLength(2)]],
      sapellido: ['', [Validators.required, Validators.minLength(2)]],
      celular: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(9), Validators.pattern('^[0-9]*$')]],
      email: ['', [Validators.required, Validators.email]],
      pass: ['', [Validators.required, Validators.minLength(6)]],
      pass2: ['', [Validators.required, Validators.minLength(6)]],
    });

    const campos = ['pnombre', 'snombre', 'papellido', 'sapellido'];
    campos.forEach(campo => {
      const control = this.registerForm.get(campo);
      if (control) {
        control.valueChanges.subscribe(() => {
          this.primeraletramayusc(control);
        });
      }
    });
  }

  ngOnInit() {
    // Leer el parámetro de email desde queryParams
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['email']) {
        this.emailValue = params['email']; // Establecer el email en el formulario
        this.registerForm.get('email')?.setValue(this.emailValue); // Asignar el valor al campo de email
      }
    });  
  }

  async register() {
    const loading = await this.loadingController.create({
      message: 'Cargando.....',
      duration: 3000,
      spinner: 'bubbles'
    });

    if (this.registerForm.invalid) {
      this.mensaje.mensaje('Error!', 'El formulario tiene datos erróneos o está incompleto!', 'error');
      return;
    }

    const { pass, pass2, rut } = this.registerForm.value;
    if (pass !== pass2) {
      this.mensaje.mensaje('Error!', 'Las contraseñas no coinciden', 'error');
      return;
    }

    try {
      const rutExiste = await this.fireStore.collection('usuarios', ref => ref.where('rut', '==', rut)).get().toPromise();

      if (rutExiste && !rutExiste.empty) {
        this.mensaje.mensaje('Error!', 'El RUT ya está registrado.', 'error');
        return; // Salir del método si el RUT ya existe
      }

      await loading.present();

      const usuarioFirebase = await this.authService.register(
        this.emailValue,
        this.passValue,
        this.pass2Value,
        this.pnombreValue,
        this.snombreValue,
        this.papellidoValue,
        this.sapellidoValue,
        this.celularValue,
        this.rutValue,
        this.fechaNacimientoValue,
        this.tipoValue
      );
      
      const user = usuarioFirebase.user;

      if (user) {
        await this.fireStore.collection('usuarios').doc(user.uid).set({
          uid: user.uid,
          rut: this.rutValue || '',
          fechaNacimiento: this.fechaNacimientoValue || '',
          pnombre: this.pnombreValue || '',
          snombre: this.snombreValue || '',
          papellido: this.papellidoValue || '',
          sapellido: this.sapellidoValue || '',
          celular: this.celularValue || '',
          email: this.emailValue || ' ',
          tipo: 'pasajero',
          usuarioDeshabilitado: this.usuarioDeshabilitado
        });

        this.mensaje.mensaje('Éxito!', 'Cuenta creada correctamente!', 'success').then(() => {
          this.authService.logout();
          this.router.navigate(['login']);
        });
      }
      
    } catch (error) {
      this.mensaje.mensaje('Error!', 'Error en crear la cuenta de usuario, inténtelo nuevamente!', 'error');
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

  mayorDeEdadValidator(control: AbstractControl): ValidationErrors | null {
    const fechaNacimiento = new Date(control.value);
    if (!control.value) return null;

    const ahora = new Date();
    const fechaLimite = new Date(ahora.getFullYear() - 18, ahora.getMonth(), ahora.getDate());

    return fechaNacimiento > fechaLimite ? { underAge: true } : null;
  }
}

// Validador personalizado para el Rut
export function rutValidator(control: AbstractControl): ValidationErrors | null {
  const rut = control.value;
  if (!rut) return null;

  const rutPattern = /^\d{1,2}\.\d{3}\.\d{3}-\d{1}$/;
  return rutPattern.test(rut) ? null : { invalidRut: true };
}
