import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Brand } from '../models/brand';
import { Car } from '../models/car';
import { ListResponseModel } from '../models/listResponseModel';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  apiUrl="https://localhost:44392/api/"

  constructor( private httpClient:HttpClient) { }



  getBrand():Observable<ListResponseModel<Brand>>{
    let newPath=this.apiUrl + "brands/getall"
    return this.httpClient.get<ListResponseModel<Brand>>(newPath)

  }
}
