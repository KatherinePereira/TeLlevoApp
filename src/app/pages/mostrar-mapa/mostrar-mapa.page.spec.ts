import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MostrarMapaPage } from './mostrar-mapa.page';

describe('MostrarMapaPage', () => {
  let component: MostrarMapaPage;
  let fixture: ComponentFixture<MostrarMapaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MostrarMapaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
