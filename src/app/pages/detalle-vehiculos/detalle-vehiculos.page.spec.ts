import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleVehiculosPage } from './detalle-vehiculos.page';

describe('DetalleVehiculosPage', () => {
  let component: DetalleVehiculosPage;
  let fixture: ComponentFixture<DetalleVehiculosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleVehiculosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
