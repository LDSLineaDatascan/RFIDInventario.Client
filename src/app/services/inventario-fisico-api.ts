import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AppConfigService } from './app-config-service';

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
    //private baseUrl = `${environment.API_URL}/inventario-fisico`;
    private baseUrl: string = '';

    constructor(private http: HttpClient, private appConfigService: AppConfigService) {
      const apiUrl = this.appConfigService.get<string>('API_URL', `${environment.API_URL}`);
      this.baseUrl = `${apiUrl}/inventario-fisico`;
      console.log("API URL InventarioFisico con config:", this.baseUrl);
    }

      obtenerInventarioPorTienda(idTienda: string): Observable<InventarioFisico[]> {
        return this.http.get<InventarioFisico[]>(`${this.baseUrl}/${idTienda}`);
      }
}