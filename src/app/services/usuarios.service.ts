import { Injectable } from '@angular/core';
import { Usuario } from '../interfaces/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  usuarios: Usuario[] =[
    {'email': 'admin@admin.cl', 'pass': 'admin1', 'tipo': 'admin', 'rut': '', 'pnombre': '', 'snombre': '', 'papellido': '', 'sapellido': '', 'celular': '', 'pass2': '', 'fechaNacimiento': ''},
    {'email': 'conductor@conductor.cl', 'pass': 'conductor', 'tipo': 'conductor', 'rut': '', 'pnombre': '', 'snombre': '', 'papellido': '', 'sapellido': '', 'celular': '', 'pass2': '', 'fechaNacimiento': ''},
    {'email': 'pasajero@pasajero.cl', 'pass': 'pasajero', 'tipo': 'pasajero', 'rut': '', 'pnombre': '', 'snombre': '', 'papellido': '', 'sapellido': '', 'celular': '', 'pass2': '', 'fechaNacimiento': ''},
  ]

  constructor() { }

  getUsuarios(): Usuario[]{ 
    return this.usuarios;
  }

  addUsuario(usuario: Usuario){
    this.usuarios.push(usuario);
  }

  deleteUsuario(){
    
  }

  updateUsuario(){

  }
}
