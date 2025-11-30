import { Injectable } from "@angular/core";
import { ToastController } from "@ionic/angular";
import Swal from "sweetalert2";

@Injectable({
    providedIn: "root",
})

export class MensajesService {

    constructor(private toastController: ToastController) {}

    mensaje(titulo: any, mensaje: any, icon: any) {
        return Swal.fire({
            title: titulo,
            text: mensaje,
            icon: icon,
            confirmButtonText: "Ok",
            heightAuto: false
        });
    }

    mensajeCorreo(titulo: any, html: any) {
        let timerInterval: any;
        return Swal.fire({
            title: titulo,
            html: html,
            timer: 2000,
            timerProgressBar: true,
            heightAuto: false,
            didOpen: () => {
                Swal.showLoading();
                timerInterval = setInterval(() => {}, 100);
            },
                willClose: () => {
                clearInterval(timerInterval);
            }
        });
    };

    mensajeDosBotones(titulo: any, mensaje: any, icon: any, confirmButtonText: any, cancelButtonText: any) {
        return Swal.fire({
            title: titulo,
            text: mensaje,
            icon: icon,
            showCancelButton: true,
            confirmButtonText: confirmButtonText,
            cancelButtonText: cancelButtonText,
            heightAuto: false
        });
    }

    async show(message: string) {
        const toast = await this.toastController.create({
          message: message,
          duration: 2000,
          position: 'bottom',
        });
        toast.present();
      }

}