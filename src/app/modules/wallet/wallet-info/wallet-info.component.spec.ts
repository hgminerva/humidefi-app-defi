import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletInfoComponent } from './wallet-info.component';

describe('WalletInfoComponent', () => {
  let component: WalletInfoComponent;
  let fixture: ComponentFixture<WalletInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
