import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  //private baseUrl = 'http://localhost:80/inventario';
    private baseUrl = 'http://rfid.local.io:80/inventario';


  constructor(private http: HttpClient) {}

  obtenerInventarioPorTienda(idTienda: string): Observable<InventarioTeorico[]> {
    return this.http.get<InventarioTeorico[]>(`${this.baseUrl}/${idTienda}`);
  }
}


