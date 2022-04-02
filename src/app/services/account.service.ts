import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  public account;
  public register;

  public accountObserve: Observable<{
    address: string,
    chainId: string,
    network: string
  }>;

  constructor(private http: HttpClient) {
    this.account = new BehaviorSubject({
      address: '',
      chainId: '',
      network: ''
    });
    this.accountObserve = this.account.asObservable();
  }

  setAccount(data: {
    address: string,
    chainId: string,
    network: string
  }) 
  {
    this.account.next(data);
  };
}
