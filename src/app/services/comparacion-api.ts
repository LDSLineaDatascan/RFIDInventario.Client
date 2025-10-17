import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ComparacionInventario {
  idProducto: string;
  nombre: string;
  categoria: string;
  stockTeorico: number;
  stockFisico: number;
  diferencia: number;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class ComparacionApi {
  //private baseUrl = 'https://localhost:7293/inventario/comparacion';
  //private baseUrl = 'http://localhost:5097/inventario/comparacion';
  //private baseUrl = 'http://localhost:80/inventario/comparacion';
  private baseUrl = 'http://rfid.local.io:80/inventario/comparacion';

  constructor(private http: HttpClient) {}

  obtenerComparacionPorTienda(idTienda: string): Observable<ComparacionInventario[]> {
    return this.http.get<ComparacionInventario[]>(`${this.baseUrl}/${idTienda}`);
  }
}
