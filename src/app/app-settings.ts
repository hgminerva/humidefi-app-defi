export class AppSettings {
    public wsProviderEndpoint = 'wss://bootnode001.humidefi.com';
    public keypair = localStorage.getItem("wallet-keypair") || "";

    public dexAccount = '5HNfKk7JdZRiwt9UZVpJRmpFpt4fPDhnh1uPEeFEQhZtggQt';
    public phpuContractAddress = localStorage.getItem("phpu-contract-address") || "";
    public lphpuAccountAddress = localStorage.getItem("lphpu-account-address") || "";
    public lphpuContractAddress = localStorage.getItem("lphpu-contract-address") || "";
    public lumiAccountAddress = localStorage.getItem("lumi-account-address") || "";
    public lumiContractAddress = localStorage.getItem("lumi-contract-address") || "";
    public swapFees = localStorage.getItem("swap-fees") || "";
    public forexUpdates = localStorage.getItem("forex-updates") || "";
}