import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Page } from './interfaces/page';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Usuario } from './interfaces/usuario';
import { AuthService } from './services/firebase/auth.service';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public appPages: Page[] = [];
  public tipoUsuario?: string;
  public emailUsuario?: string;

  constructor(private router: Router, private authService: AuthService,private firestore: AngularFirestore, private menuController: MenuController) {}

  ngOnInit() {
    this.configSideMenu();   
    this.menuController.enable(false); 
    this.authService.monitorUsuarioDeshabilitado();
  }

  async configSideMenu(){
    this.authService.isLogged().subscribe(async(user)=>{
      if(user){

        this.menuController.enable(true);

        const usuario = await this.firestore.collection('usuarios').doc(user.uid).get().toPromise();
        const userdata = usuario?.data() as Usuario;

        this.emailUsuario = user.email;

        if (userdata.tipo === 'admin') {
          this.appPages = [
            { title: 'Home', url: '/home', icon: 'home' },
            { title: 'Vehículos Usuarios', url: '/vehiculos', icon: 'car' },
            { title: 'Usuarios', url: '/admin-dashboard', icon: 'people' },
            { title: 'Cerrar Sesión', url: '/login', icon: 'log-out' }
          ];
        } else if (userdata.tipo === 'conductor') {
          this.appPages = [
            { title: 'Home', url: '/home2', icon: 'home' },
            { title: 'Tus Vehículos', url: '/vehiculosConductor', icon: 'car' },
            { title: 'Agregar nuevo vehículo', url: '/conductor', icon: 'add' },
            { title: 'Cerrar Sesión', url: '/login', icon: 'log-out' }
          ];
        } else {
          this.appPages = [
            { title: 'home', url: '/home', icon: 'home' },
            { title: 'Cerrar Sesión', url: '/login', icon: 'log-out' }
          ];
        }
      }else{
        this.menuController.enable(false);
      }
    });
  }

  vermisdatos(){
    this.router.navigate(['/mis-datos']);
    this.menuController.close();
  }

  logout() {
    this.authService.logout();
    this.menuController.enable(false);
    this.router.navigate(['/login']);
  }
}