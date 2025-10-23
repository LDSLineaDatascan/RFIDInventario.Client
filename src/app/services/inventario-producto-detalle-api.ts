import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AppConfigService } from './app-config-service';

@Injectable({
  providedIn: 'root'
})
export class ProductoDetalleApi {
  //private baseUrl = 'http://localhost:5097';
  //private baseUrl = `${environment.API_URL}`;
  private baseUrl: string = '';

  constructor(private http: HttpClient, private appConfigService: AppConfigService) {
    const apiUrl = this.appConfigService.get<string>('API_URL', `${environment.API_URL}`);
    this.baseUrl = `${apiUrl}`;
    console.log("API URL ProductoDetalle con config:", this.baseUrl);
  }

  getDetalleProducto(idTienda: string, idProducto: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Inventario/detalleProducto/${idTienda}/${idProducto}`);
  }

  reiniciarInventario(idTienda: string, idProducto: string): Observable<any> {
    /*const body = {
      codigo: idProducto,
      idTienda: idTienda
    };*/
    const url = `${this.baseUrl}/Inventario/reiniciarProducto/${idTienda}/${idProducto}`;
    return this.http.post(url, null);
    //return this.http.post<any>(`${this.baseUrl}/Inventario/reiniciarProducto`, url);
  }

  getTagsProducto(idTienda: string, idProducto: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Inventario/tagsProducto/${idTienda}/${idProducto}`);
  }
}
