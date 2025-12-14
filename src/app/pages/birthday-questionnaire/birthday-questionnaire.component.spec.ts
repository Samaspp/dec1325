import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BirthdayQuestionnaireComponent } from './birthday-questionnaire.component';

describe('BirthdayQuestionnaireComponent', () => {
  let component: BirthdayQuestionnaireComponent;
  let fixture: ComponentFixture<BirthdayQuestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BirthdayQuestionnaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BirthdayQuestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
