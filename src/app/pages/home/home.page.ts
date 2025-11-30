import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { Usuario } from 'src/app/interfaces/usuario';
import { AuthService } from 'src/app/services/firebase/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  userLogin? : string;
  public userName? : string; 
  public userApellido? : string;

  constructor(private router: Router, private menuController:MenuController, private authService: AuthService, private firestore: AngularFirestore) { }

  ngOnInit() {
    this.menuController.enable(true);
    this.datoUser();
  }

  async datoUser(){
    this.authService.isLogged().subscribe(async(user)=>{
      if(user){
        const usuario = await this.firestore.collection('usuarios').doc(user.uid).get().toPromise();
        const userdata = usuario?.data() as Usuario;

        this.userName = userdata.pnombre;
        this.userApellido = userdata.papellido;
      }
    });
  }
}
