import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Inject } from "@angular/core";
import { environment } from "../../environments/environment";
import { AppConfigService } from "./app-config-service";

export interface Tienda{
    codigo: string;
    nombre: string;
    estado_Conteo?: String;
}

@Injectable({ providedIn: 'root' })
export class TiendaApi {
  //private baseUrl = 'https://localhost:7293';
 // private baseUrl = 'http://localhost:5097';
 //private baseUrl = `${environment.API_URL}`;
 private baseUrl: string = '';

  constructor(private http: HttpClient, private appConfigService: AppConfigService) {
    const apiUrl = this.appConfigService.get<string>('API_URL', `${environment.API_URL}`);
    this.baseUrl = `${apiUrl}`;
    console.log("API URL Tienda con config:", this.baseUrl);
  }

  obtenerTiendas(): Observable<Tienda[]> {
    return this.http.get<Tienda[]>(`${this.baseUrl}/tiendas`);
  }
}
