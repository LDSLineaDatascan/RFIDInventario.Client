import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AppConfigService } from './app-config-service';

export interface Producto 
{
  codigo: string;
  nombre: string;
  categoria: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoApi {

  //private apiUrl = 'https://localhost:7293/producto';
  //private apiUrl = 'http://localhost:5097/producto';
  //private apiUrl = `${environment.API_URL}/producto`;
  private apiUrl: string = '';

  constructor(private http: HttpClient, private appConfigService: AppConfigService) {
    const apiUrl = this.appConfigService.get<string>('API_URL', `${environment.API_URL}`);
    this.apiUrl = `${apiUrl}/producto`;
    console.log("API URL Producto con config:", this.apiUrl);
  }

  obtenerProductos(): Observable<Producto[]> 
  {
    return this.http.get<Producto[]>(this.apiUrl);
  }
}
