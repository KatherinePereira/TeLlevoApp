import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehiculosConductorPage } from './vehiculos-conductor.page';

describe('VehiculosConductorPage', () => {
  let component: VehiculosConductorPage;
  let fixture: ComponentFixture<VehiculosConductorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VehiculosConductorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
