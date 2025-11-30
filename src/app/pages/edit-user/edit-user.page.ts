import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Usuario } from 'src/app/interfaces/usuario';
import { MensajesService } from 'src/app/services/mensajes.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.page.html',
  styleUrls: ['./edit-user.page.scss'],
})
export class EditUserPage implements OnInit {
  uid: string = '';
  editUserForm: FormGroup;

  constructor(private activatedRoute: ActivatedRoute,
              private firestore: AngularFirestore,
              private formBuilder: FormBuilder,
              private router: Router,
              private mensajes: MensajesService
  ) { 
    this.editUserForm = this.formBuilder.group({
      uid: [{ value: '' }],  // Campo para mostrar el UID deshabilitado
      email: ['', [Validators.required, Validators.email]],
      pnombre: ['', Validators.required],
      snombre: [''],
      papellido: ['', Validators.required],
      sapellido: ['', Validators.required],
      celular: ['', Validators.required],
      tipo: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.uid = this.activatedRoute.snapshot.paramMap.get('uid') as string;
    this.loadData();
  }

  loadData() {
    this.firestore.collection('usuarios').doc(this.uid).get().toPromise().then((user) => {
      if (user) {
        const userData = user?.data() as Usuario;
        this.editUserForm.patchValue({
          uid: this.uid,  // Asignar el UID al campo del formulario
          email: userData.email,
          pnombre: userData.pnombre,
          snombre: userData.snombre,
          papellido: userData.papellido,
          sapellido: userData.sapellido,
          celular: userData.celular,
          tipo: userData.tipo,
        });
      }
    })
    .catch((error) => {
      console.error('Error loading user data:', error);
    });
  }

  async actualizarUser() {
    if (this.editUserForm.valid) {
      await this.firestore.collection('usuarios').doc(this.uid).update(this.editUserForm.getRawValue()).then(async () => {
        this.mensajes.mensaje('Hecho!', 'El formulario se ha actualizado!', 'success');
        this.router.navigate(['admin-dashboard']);
      })
      .catch(error => {
        this.mensajes.mensaje('Error!', 'El formulario no se ha podido modificar!', 'error');
      });
    }
  }
}
