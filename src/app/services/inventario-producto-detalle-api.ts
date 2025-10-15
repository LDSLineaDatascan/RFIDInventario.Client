import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoDetalleApi {
  private baseUrl = 'http://localhost:93';

  constructor(private http: HttpClient) {}

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
