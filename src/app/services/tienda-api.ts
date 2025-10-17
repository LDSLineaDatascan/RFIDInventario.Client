import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Inject } from "@angular/core";

export interface Tienda{
    codigo: string;
    nombre: string;
    estado?: String;
}

@Injectable({ providedIn: 'root' })
export class TiendaApi {
  //private baseUrl = 'https://localhost:7293';
  //private baseUrl = 'http://localhost:5097';
  //private baseUrl = 'http://localhost:80';
  private baseUrl = 'http://rfid.local.io:80';

  constructor(private http: HttpClient) {}  

  obtenerTiendas(): Observable<Tienda[]> {
    return this.http.get<Tienda[]>(`${this.baseUrl}/tiendas`);
  }
}
