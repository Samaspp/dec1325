import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsgoWeaponsComponent } from './csgo-weapons.component';

describe('CsgoWeaponsComponent', () => {
  let component: CsgoWeaponsComponent;
  let fixture: ComponentFixture<CsgoWeaponsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CsgoWeaponsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CsgoWeaponsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should auto-select first weapon on init', () => {
    expect(component.selectedWeapon).toBeTruthy();
    expect(component.selectedWeapon?.id).toBe(component.weapons[0].id);
  });

  it('should have target with full health initially', () => {
    expect(component.target.health).toBe(100);
    expect(component.target.isAlive).toBe(true);
    expect(component.target.isGhost).toBe(false);
  });

  it('should calculate health percentage correctly', () => {
    component.target.health = 50;
    expect(component.healthPercentage).toBe(50);
  });

  it('should select weapon when clicked', () => {
    const weapon = component.weapons[2];
    component.selectWeapon(weapon);
    expect(component.selectedWeapon?.id).toBe(weapon.id);
  });
});
