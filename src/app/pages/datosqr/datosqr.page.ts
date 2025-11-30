import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/firebase/auth.service';

@Component({
  selector: 'app-datosqr',
  templateUrl: './datosqr.page.html',
  styleUrls: ['./datosqr.page.scss'],
})
export class DatosqrPage implements OnInit {
  uid: any;
  userData: any; // Para almacenar los datos del usuario

  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(aux => {  
      this.uid = aux['uid'];  
      this.getUserData(this.uid); // Llama a la función para obtener los datos del usuario
    });
  }

  getUserData(uid: string) {
    this.authService.getUsuario(uid).subscribe(data => {
      this.userData = data; // Asigna los datos del usuario a la propiedad
    });
  }
}
