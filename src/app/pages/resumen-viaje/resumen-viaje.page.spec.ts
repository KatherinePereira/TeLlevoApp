import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResumenViajePage } from './resumen-viaje.page';

describe('ResumenViajePage', () => {
  let component: ResumenViajePage;
  let fixture: ComponentFixture<ResumenViajePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ResumenViajePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
