export class AppSettings {
    public wsProviderEndpoint = 'wss://humidefi-node1.liteclerk.com:443';
    public currencies = [
        {
            currency: "PHP",
            tokensPrices: [
                { token: 'UMI', price: 52 },
                { token: 'PHPU', price: 1 }
            ]
        },
        {
            currency: "USD",
            tokensPrices: [
                { token: 'UMI', price: 1 },
                { token: 'PHPU', price: 52 }
            ]
        },
    ];
}