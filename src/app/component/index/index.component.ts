import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { AccountService } from 'src/app/services/account.service';
import { StorageService } from 'src/app/services/storage.service';
import { ContractService } from 'src/app/services/contract.service';
import { ToastrService } from 'ngx-toastr';
import Web3 from 'web3';

// Connect Wallet
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";

// Set web3 and connector
let web3 = new Web3(window['ethereum']);
let connector = new WalletConnect({
  bridge: "https://bridge.walletconnect.org"
});

const abiToken = require('src/contracts/abi/tokenSale.json');
const contractToken = new web3.eth.Contract(abiToken, environment.TOKENSALE_ADDRESS);

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {
  @ViewChild('uiWallet') uiWallet;
  ethereum: any;
  account: any = {};
  connector: any;
  getChainIdInterval: any;
  contractAddress: string;
  getBalanceInterval: NodeJS.Timeout;
  saleEnd: string;
  saleStart: string;
  tokenName: any;
  tokenSymbol: any;
  getDecimal: any;
  tokenRate: any;
  calculatorFromText: any;
  calculatorToText: any;
  tokenBalance: any;
  tokenPurchase: any;
  from: any;
  calculatorFrom: any;
  to: any;
  calculatorTo: any;
  getTransError: boolean = false;
  getTransErrorText: string;
  isLoading: boolean = false;
  tokenProcess:boolean = false;
  txHash: any;
  alertSuccess: boolean = true;
  totalSupply: any;
  networkName: any;
  networkType: any;
  LOGO:any;
  TITLE:any;
  NETWORK:any;
  TYPE:any;
  FROMTOKENNAME:any;
  TOTOKENNAME:any;
  TRANSLINK:any;
  SUPPORTMAIL:any;
  FACEBOOK: any;
  INSTAGRAM: any;
  PINTEREST: any;
  TWITTER: any;
  GOOGLE: any;
  WHATSAPP: any;
  LINKEDIN: any;
  todayDate : Date = new Date();
  allowNetwork:boolean = false;
  checkNetworkInterval: NodeJS.Timeout;
  /**
   * 
   * @param accountService 
   * @param storageService 
   * @param ContractService 
   * @param toastr 
   */
  constructor(
    private accountService: AccountService, 
    private storageService: StorageService,
    private ContractService: ContractService,
    private toastr: ToastrService
  ) { }

  
  ngOnInit(): void {
    this.NETWORK = environment.NETWORK;
    this.TYPE = environment.TYPE;
    this.LOGO = environment.LOGO;
    this.TITLE = environment.TITLE;
    this.FROMTOKENNAME = environment.FROMTOKENNAME;
    this.TOTOKENNAME = environment.TOTOKENNAME;
    this.TRANSLINK = environment.TRANSLINK;
    this.SUPPORTMAIL = environment.SUPPORTMAIL;
    this.FACEBOOK = environment.FACEBOOK;
    this.INSTAGRAM = environment.INSTAGRAM;
    this.PINTEREST = environment.PINTEREST;
    this.TWITTER = environment.TWITTER;
    this.GOOGLE = environment.GOOGLE;
    this.WHATSAPP = environment.WHATSAPP;
    this.LINKEDIN = environment.LINKEDIN;
    this.conn();
    this.account = this.storageService.getItem('account') === null ? { address: "", network: "", chainId: "", provider: "" } : JSON.parse(this.storageService.getItem('account'));
    this.setAccount(this.account.address, this.account.chainId, this.account.provider);
    this.contractAddress = this.ContractService.getContractAddress();
    if (this.account.provider === 'metamask') {
      this.ethereum = window['ethereum'];
      this.metamastListener();
      this.getBalanceInterval =  setInterval(() => this.getBalance(), 500)
    } else if (this.account.provider === 'trustwallet') {
      this.connector = new WalletConnect({
        bridge: "https://bridge.walletconnect.org", // Required
      });
      this.wallectConnectListener();
      this.getBalanceInterval = setInterval(() => this.getBalance(), 500)
      this.checkNetworkInterval = setInterval(() => this.checkNetwork(), 500)
    }
    
  }

  checkNetwork(){
    this.allowNetwork = false;
    if(this.NETWORK == 'ETH'){
      this.networkName = 'Ethereum';
      if(this.TYPE == 'TESTNET'){
        this.networkType = 'Testnet';
        if(this.account.chainId == '0x3' || this.account.chainId == '0x4'){
          this.allowNetwork = true;
        }
        else{
          // this.allowNetwork = false;
        }
      }
      if(this.TYPE == 'MAINNET'){
        this.networkType = 'Mainnet';
        if(this.account.chainId == '0x1'){
          this.allowNetwork = true;
        }
        else{
          // this.allowNetwork = false;
        }
      }
    }
    if(this.NETWORK == 'BSC'){
      this.networkName = 'Binance';
      if(this.TYPE == 'TESTNET'){
        this.networkType = 'Testnet';
        if(this.account.chainId == '0x61'){
          this.allowNetwork = true;
        }
        else{
          // this.allowNetwork = false;
        }
      }
      if(this.TYPE == 'MAINNET'){
        this.networkType = 'Mainnet';
        if(this.account.chainId == '0x38'){
          this.allowNetwork = true;
        }
        else{
          // this.allowNetwork = false;
        }
      }
    }
    this.timeOut();
  }

  conn = async () => {
    let closingTime = await this.ContractService.getClosingTime();
    let startingTime = await this.ContractService.getStartingTime();
    const closingDate = new Date(new Date(closingTime*1000).toISOString());
    const startingDate = new Date(new Date(startingTime*1000).toISOString());
    this.saleEnd = closingDate.getDate()+"/"+(closingDate.getMonth()+1)+"/"+closingDate.getFullYear()+" "+closingDate.getHours()+":"+closingDate.getMinutes()+":"+closingDate.getSeconds();
    this.saleStart = startingDate.getDate()+"/"+(startingDate.getMonth()+1)+"/"+startingDate.getFullYear()+" "+startingDate.getHours()+":"+startingDate.getMinutes()+":"+startingDate.getSeconds();
    this.tokenName = await this.ContractService.getName();
    this.tokenSymbol = await this.ContractService.getSymbol();
    this.getDecimal = await this.ContractService.getDecimal();
    this.totalSupply = await this.ContractService.totalSupply()/10**this.getDecimal;
    this.tokenRate = await this.ContractService.getRate();
    this.tokenRate = this.convert(this.tokenRate);
    this.calculatorFromText = 1;
    this.calculatorToText = this.tokenRate;  
  } 

  getChainId = async () => {
    this.setNetwork(this.account.chainId);
  }
  
  ngOnDestroy(){
    clearInterval(this.getBalanceInterval);
    clearInterval(this.getChainIdInterval);
    clearInterval(this.checkNetworkInterval);
  }
  
  async getBalance() {
    this.tokenBalance = await this.ContractService.getBalanceOf(this.account.address);
    this.getDecimal = await this.ContractService.getDecimal();
    this.tokenPurchase = this.tokenBalance/10**this.getDecimal;
    if(this.tokenPurchase == "" || this.tokenPurchase == undefined){
      this.tokenPurchase = 0;
    }
  }
  
  fromInput(){
    this.from = (<HTMLInputElement>document.getElementById("from")).value;
    // Calculate
    if(this.from == ""){
      this.from = '0';
    }
    this.calculatorFrom = this.from * this.tokenRate;
    (<HTMLInputElement>document.getElementById("to")).value = this.convert(this.calculatorFrom);
    this.calculatorToText = this.convert(this.calculatorFrom);
    this.calculatorFromText = this.convert(this.from);  
  }

  toInput(){
    this.to = (<HTMLInputElement>document.getElementById("to")).value;
    if(this.to == ""){
      this.from = '0';
    }
    // Calculate
    this.calculatorTo = this.to / this.tokenRate;
    (<HTMLInputElement>document.getElementById("from")).value = this.convert(this.calculatorTo);
    this.calculatorToText = this.convert(this.to);
    this.calculatorFromText = this.convert(this.calculatorTo);  
  }

  buyNow = async () => {
    this.getTransError = false;  
    if (!this.account.address) {
         this.toastr.error("Connect to the wallet");
          this.isLoading = false;
          return false;
    } 
    else if (this.account.address) {
      this.isLoading = true;
      if((<HTMLInputElement>document.getElementById("from")).value == ""){
        this.toastr.error("Invalid Inputs");
        this.isLoading = false;
        return false;
      }
      try {
        const calculatorFrom = web3.utils.toWei((<HTMLInputElement>document.getElementById("from")).value, 'ether');
        //set up your Ethereum transaction
        const transactionParameters = {
            to: environment.TOKENSALE_ADDRESS, // Required except during contract publications.
            from: this.account.address, // must match user's active address. 
            value: web3.utils.toHex(calculatorFrom),
            
            data: contractToken.methods.buyToken(this.account.address).encodeABI(), //make call to NFT smart contract 
            gas:"200000"
        }
          //sign transaction via Metamask
        try {
          let walletconnectCheck = this.storageService.getItem('walletconnect');
          if(walletconnectCheck == ""){
            const txHash = await this.ethereum
            .request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
            });
            this.txHash = txHash;
            this.tokenProcess = true;
            this.isLoading = false;
            this.toastr.success("Transactions Completed");
          }
          else{
            let provider = (this.account.provider === 'metamask') ? web3.eth.sendTransaction(transactionParameters) : connector.sendTransaction(transactionParameters);
          provider
            .then((receipt) => {
              this.account.provider === 'metamask' ? this.txHash = receipt.transactionHash : this.txHash = receipt;
              this.isLoading = false;
              this.tokenProcess = true;
              this.toastr.success("Transactions Completed");
            })
            .catch((error) => {
              this.toastr.error(error.message);
              this.isLoading = false;
            })
          }
        } 
        catch (error) {
          console.log("error",error);
          if(error.code == 4001){
            this.toastr.error("User denied transaction");
          }
            this.isLoading = false;
        }
      } 
      catch (err) {
        console.log("error",err);
          this.isLoading = false;
          return false;
      }
    } 
    else {
          this.toastr.error("Connect to the wallet");
          this.isLoading = false;
          return false;
    }
  }

  connectWallet = async () => {
    // Create a connector
    this.connector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org", // Required
      qrcodeModal: QRCodeModal,
    });
    // Check if connection is already established
    if (!this.connector.connected) {
      // create new session
      this.connector.createSession();
    }
    this.wallectConnectListener();
  }

  public wallectConnectListener() {
    // Subscribe to connection events
    this.connector.on("connect", (error, payload) => {
      if (error) {
        throw error;
      }
      // Get provided accounts and chainId
      const { accounts, chainId } = payload.params[0];
      this.setAccount(accounts[0], chainId, 'trustwallet');
      this.checkNetworkInterval = setInterval(() => this.checkNetwork(), 500)
    });

    this.connector.on("session_update", (error, payload) => {
      if (error) {
        throw error;
      }
      // Get updated accounts and chainId
      const { accounts, chainId } = payload.params[0];
      this.setAccount(accounts[0], chainId, 'trustwallet');
      this.checkNetworkInterval = setInterval(() => this.checkNetwork(), 500)
    });

    this.connector.on("disconnect", (error, payload) => {
      if (error) {
        throw error;
      }

      // Delete connector
      this.setAccount("", "", "");
      this.checkNetworkInterval = setInterval(() => this.checkNetwork(), 500)
    });
  }
// Meta mask connection
  connectMetamask = async () => {
    this.ethereum = window['ethereum'];
    if (typeof this.ethereum !== 'undefined') {
    }
    const accounts = await this.ethereum.request({ method: 'eth_requestAccounts' });
    this.setAccount(accounts[0], this.ethereum.chainId, 'metamask');
    this.metamastListener();
    this.uiWallet.nativeElement.click();
  }

  public metamastListener() {
    // Listener
    this.ethereum.on('accountsChanged', (accounts) => {
      this.setAccount(accounts[0], this.ethereum.chainId, 'metamask');
      console.log("accounts[0]",accounts[0]);
      this.checkNetworkInterval = setInterval(() => this.checkNetwork(), 500)
    });
    this.ethereum.on('chainChanged', (chainId) => {
      this.setAccount(this.account.address, chainId, 'metamask');
      this.checkNetworkInterval = setInterval(() => this.checkNetwork(), 500)
    });
    this.checkNetworkInterval = setInterval(() => this.checkNetwork(), 500)
    this.storageService.setItem("walletconnect","");
  }
  /**
   * Store account details
   * @param address 
   * @param chainId 
   * @param provider 
   */
  public async setAccount(address, chainId, provider) {
    let account;
    if (address != "") {
      account = { address: address, chainId: chainId, network: await this.setNetwork(chainId), provider: provider }
    } else {
      account = { address: "", network: "", chainId: "", provider: "" };
    }
    if (address == undefined) {
      account = { address: "", network: "", chainId: "", provider: "" };
    }
    this.accountService.setAccount(account);
    this.account = Object.assign({}, account);
    this.storageService.setItem('account', JSON.stringify(this.account));
  }

 /**
  * Network Details
  * @param chainId 
  * @returns 
  */
  public setNetwork(chainId) {
    let network;
    switch (chainId) {
      case '0x1':
      case 1:
        network = "Mainnet";
        break;
      case '0x3':
      case 3:
        network = "Ropsten";
        break;
      case '0x4':
      case 4:
        network = "Rinkeby";
        break;
      case '0x38':
      case 56:
        network = 'BSC Mainnet';
        break;
      case '0x61':
      case 97:
        network = 'BSC Testnet';
        break;
      default:
        network = 'Unknown';
        break;
    }
    return network;
  }

   // Convert Expontential value
   convert(n){
    var sign = +n < 0 ? "-" : "",
        toStr = n.toString();
    if (!/e/i.test(toStr)) {
        return n;
    }
    var [lead,decimal,pow] = n.toString()
        .replace(/^-/,"")
        .replace(/^([0-9]+)(e.*)/,"$1.$2")
        .split(/e|\./);
    return +pow < 0 
        ? sign + "0." + "0".repeat(Math.max(Math.abs(pow)-1 || 0, 0)) + lead + decimal
        : sign + lead + (+pow >= decimal.length ? (decimal + "0".repeat(Math.max(+pow-decimal.length || 0, 0))) : (decimal.slice(0,+pow)+"."+decimal.slice(+pow)))
  }
  
  timeOut(){
    setTimeout(()=>{                           // <<<---using ()=> syntax
      this.alertSuccess = false;
    }, 5000);
  
  }

  disconnect(){
    this.storageService.setItem('walletconnect', "");
    this.setAccount("", "", "");
    this.uiWallet.nativeElement.click();
  }

}
