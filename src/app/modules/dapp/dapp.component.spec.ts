import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DappComponent } from './dapp.component';

describe('DappComponent', () => {
  let component: DappComponent;
  let fixture: ComponentFixture<DappComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DappComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DappComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
