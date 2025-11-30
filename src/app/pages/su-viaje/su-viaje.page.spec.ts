import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuViajePage } from './su-viaje.page';

describe('SuViajePage', () => {
  let component: SuViajePage;
  let fixture: ComponentFixture<SuViajePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SuViajePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
