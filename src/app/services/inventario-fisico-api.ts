import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InventarioFisico {
  idTienda: string;
  tienda: string;
  idProducto: string;
  producto: string;
  categoria: string;
  cantidadLectura: number;
}

@Injectable({ providedIn: 'root' })
export class InventarioFisicoApi {

    //private baseUrl = 'https://localhost:7293/inventario-fisico';
    //private baseUrl = 'http://localhost:5097/inventario';
    private baseUrl = `${environment.API_URL}/inventario-fisico`;

    constructor(private http: HttpClient) {}

      obtenerInventarioPorTienda(idTienda: string): Observable<InventarioFisico[]> {
        return this.http.get<InventarioFisico[]>(`${this.baseUrl}/${idTienda}`);
      }
}