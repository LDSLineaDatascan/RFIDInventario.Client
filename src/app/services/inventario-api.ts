import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InventarioTeorico {
  idTienda: string;
  tienda: string;
  idProducto: string;
  producto: string;
  categoria: string;
  cantidad: number;
  cantidadLectura: number;
}

@Injectable({ providedIn: 'root' })
export class InventarioApi {
  //private baseUrl = 'https://localhost:7293/inventario';
  //private baseUrl = 'http://localhost:5097/inventario';
  private baseUrl = `${environment.API_URL}/inventario`;

  constructor(private http: HttpClient) {}

  obtenerInventarioPorTienda(idTienda: string): Observable<InventarioTeorico[]> {
    return this.http.get<InventarioTeorico[]>(`${this.baseUrl}/${idTienda}`);
  }
}


