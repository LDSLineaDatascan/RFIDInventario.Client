import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AppConfigService } from './app-config-service';

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
  //private baseUrl = `${environment.API_URL}/inventario`;
  private baseUrl  = '';

  constructor(private http: HttpClient, private appConfigService: AppConfigService) {
    const baseUrl = this.appConfigService.get<string>('API_URL', `${environment.API_URL}`);
    this.baseUrl= `${baseUrl}/inventario`;
    console.log("API URL Inventario con config:", this.baseUrl);
  }

  obtenerInventarioPorTienda(idTienda: string): Observable<InventarioTeorico[]> {
    return this.http.get<InventarioTeorico[]>(`${this.baseUrl}/${idTienda}`);
  }
}


