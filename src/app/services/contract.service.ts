import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import Web3 from 'web3';

const web3 = new Web3(environment.PROVIDER);
const abi = require('src/contracts/abi/contract.json');
const contract = new web3.eth.Contract(abi, environment.CONTRACT_ADDRESS);
const abiToken = require('src/contracts/abi/tokenSale.json');
const contractToken = new web3.eth.Contract(abiToken, environment.TOKENSALE_ADDRESS);

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  constructor() { }
  async getName() {
    const name = await contract.methods.name().call();
    return name;
  }
  
  async getSymbol() {
    const getSymbol = await contract.methods.symbol().call();
    return getSymbol;
  }
  async getDecimal() {
    const getDecimal = await contract.methods.decimals().call();
    return getDecimal;
  }
  async getBalanceOf(address) {
    const balanceOf = await contract.methods.balanceOf(address).call();
    return balanceOf;
  }
  async getRate() {
    const rate = await contractToken.methods.rate().call();
    return rate;
  }
  async getClosingTime() {
    const closingTime = await contractToken.methods.closingTime().call();
    return closingTime;
  }
  async getStartingTime() {
    const startingTime = await contractToken.methods.openingTime().call();
    return startingTime;
  }
  public getContractAddress() {
    const ContractAddress = environment.CONTRACT_ADDRESS;
    return ContractAddress;
  }

  async totalSupply() {
    const totalSupply = await contract.methods.totalSupply().call();
    return totalSupply;
  }

}
