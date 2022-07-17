import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PolkadotIdentIconModule } from 'polkadot-angular-identicon';

import { AppRoutingModule } from './app-routing.module';

import { AppSettings } from './app-settings';

import { AppComponent } from './app.component';
import { PolkadotIdenticonComponent } from './shared/polkadot-identicon/polkadot-identicon.component';

@NgModule({
  declarations: [
    AppComponent,
    PolkadotIdenticonComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    PolkadotIdentIconModule,
    AppRoutingModule
  ],
  providers: [
    AppSettings
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
