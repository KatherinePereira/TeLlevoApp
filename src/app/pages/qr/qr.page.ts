import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { MensajesService } from 'src/app/services/mensajes.service';
import { BarcodeScanningModalComponent } from '../su-viaje/barcode-scanning-modal.component';
import { LensFacing } from '@capacitor-mlkit/barcode-scanning';

@Component({
  selector: 'app-qr',
  templateUrl: './qr.page.html',
  styleUrls: ['./qr.page.scss'],
})
export class QrPage implements OnInit {
  qrValue = '';
  segment = 'scan';
  scanResult = '';

  constructor(private authService: AuthService,
    private modalController: ModalController,
    private platform: Platform,
    private router: Router,
    private mensajeService: MensajesService
  ) { }

  ngOnInit() {
    this.authService.isLogged().subscribe(user=>{
      this.qrValue = user.uid
    });
  }

  async startScan() {
    if (!this.platform.is('capacitor')) {
      this.mensajeService.show('Barcode scanning is not supported on this platform.');
      return;
    }

    const modal = await this.modalController.create({
      component: BarcodeScanningModalComponent,
      cssClass: 'barcode-scanning-modal', 
      showBackdrop : false,
      componentProps: {
        formats: [],
        LensFacing: LensFacing.Back, 
      },
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data?.barcode?.displayValue) {
      this.scanResult = data.barcode.displayValue;
      setTimeout(() => {
        this.router.navigate(['/datosqr', this.scanResult]);
      }, 1000);
    }
  }
}
