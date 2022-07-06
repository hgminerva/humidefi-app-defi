import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSettings } from 'src/app/app-settings';
import { ForexModel } from 'src/app/models/forex.model';

@Injectable({
  providedIn: 'root'
})
export class ForexService {

  constructor(
    private appSettings: AppSettings,
    private httpClient: HttpClient
  ) { }

  public options: any = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };

  public getRates(): Observable<ForexModel> {
    return new Observable<ForexModel>((observer) => {
      let forex: ForexModel = new ForexModel();
      let symbols: string = "PHP,USD";
      let url: string = "https://api.apilayer.com/exchangerates_data/latest?symbols=" + symbols + "&base=USD&apikey=ZJreYDBdVjj4At2CL2i6svqWYsDipzna";

      this.httpClient.get(url, this.options).subscribe(
        response => {
          let results: any = response;

          if (results != null) {
            var data = results;

            forex = {
              success: data.success,
              timestamp: data.timestamp,
              base: data.base,
              date: data.date,
              rates: {
                PHP: data.rates.PHP,
                USD: data.rates.USD
              }
            };
          }

          observer.next(forex);
          observer.complete();
        },
        error => {
          observer.next(new ForexModel());
          observer.complete();
        }
      );
    });
  }
}
