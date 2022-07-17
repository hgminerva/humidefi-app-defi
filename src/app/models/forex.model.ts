export class ForexModel {
    success: string = "";
    timestamp: string = "";
    base: string = "";
    date: string = "";
    rates: ForexRatesModel = new ForexRatesModel();
}

export class ForexRatesModel {
    PHP: number = 0;
    USD: number = 0;
}
