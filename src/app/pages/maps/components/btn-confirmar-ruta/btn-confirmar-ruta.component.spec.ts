import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BtnConfirmarRutaComponent } from './btn-confirmar-ruta.component';

describe('BtnConfirmarRutaComponent', () => {
  let component: BtnConfirmarRutaComponent;
  let fixture: ComponentFixture<BtnConfirmarRutaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BtnConfirmarRutaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BtnConfirmarRutaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
