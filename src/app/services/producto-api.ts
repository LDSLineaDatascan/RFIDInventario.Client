import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
  private apiUrl = `${environment.API_URL}/producto`;

  constructor(private http: HttpClient) { }

  obtenerProductos(): Observable<Producto[]> 
  {
    return this.http.get<Producto[]>(this.apiUrl);
  }
}
