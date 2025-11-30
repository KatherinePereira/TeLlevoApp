import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatosqrPage } from './datosqr.page';

describe('DatosqrPage', () => {
  let component: DatosqrPage;
  let fixture: ComponentFixture<DatosqrPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DatosqrPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
