import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AppConfigService } from './app-config-service';

@Injectable({
  providedIn: 'root'
})
export class InventarioCategoriaDetalleApi {
  
  //private baseUrl = 'http://localhost:5097'; 
  //private baseUrl = environment.API_URL;
  private baseUrl  = '';

  constructor(private http: HttpClient, private appConfigService: AppConfigService) {
    const apiUrl = this.appConfigService.get<string>('API_URL', `${environment.API_URL}`) ;
    this.baseUrl= `${apiUrl}`;
    console.log("API URL InventarioCategoriaDetalle con config:", this.baseUrl);
  }

  obtenerProductosPorCategoria(idTienda: string, categoria: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/inventario/detalleCategoria/${idTienda}/${categoria}`);
  }

  reiniciarInventarioCategoria(idTienda: string, categoria: string): Observable<void> {
  return this.http.post<void>(
    `${this.baseUrl}/Inventario/inventario/reiniciarCategoria/${idTienda}/${categoria}`, 
    {}
  );
}

getDetalleProducto(idTienda: string, idProducto: string): Observable<any> {
  return this.http.get(`${this.baseUrl}/inventario/detalleProducto/${idTienda}/${idProducto}`);
}


}
