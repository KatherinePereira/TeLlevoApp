import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { MensajesService } from 'src/app/services/mensajes.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.page.html',
  styleUrls: ['./recuperar.page.scss'],
})
export class RecuperarPage implements OnInit {
  alertButtons = ['Action'];

  recuperarForm: FormGroup;

  constructor(
    private router: Router, 
    private alertController: AlertController, 
    private formBuilder: FormBuilder, 
    private loadingController: LoadingController, 
    private authService: AuthService,
    private mensaje: MensajesService
  ) {
    this.recuperarForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {}

  async recuperarContrasenia() {
    if (this.recuperarForm.invalid) {
      this.recuperarForm.markAllAsTouched(); // Marcar todos los campos como tocados para mostrar los errores
      return;
    }

    try {
      let timerInterval: any;
      await this.authService.recuperarContrasenia(this.recuperarForm.value.email);
      this.mensaje.mensajeCorreo('Procesando!', 'Enviando correo...').then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
          this.mensaje.mensaje('Éxito!', 'Correo enviado correctamente!', 'success');
        }
      });
    } catch (error) {
      this.mensaje.mensaje('Error!', 'Hubo un error al enviar el correo.', 'error');
    }
  }
}
