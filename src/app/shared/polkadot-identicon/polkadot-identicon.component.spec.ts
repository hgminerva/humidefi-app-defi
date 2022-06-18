import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolkadotIdenticonComponent } from './polkadot-identicon.component';

describe('PolkadotIdenticonComponent', () => {
  let component: PolkadotIdenticonComponent;
  let fixture: ComponentFixture<PolkadotIdenticonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PolkadotIdenticonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolkadotIdenticonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
