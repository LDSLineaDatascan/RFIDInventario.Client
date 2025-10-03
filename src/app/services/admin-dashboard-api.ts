import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SignalRService } from './signalr-api';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {

  private apiUrl = 'http://localhost:5097/api/usuarios';

  constructor(private http: HttpClient) { }

  getUsuarios(): Observable<any> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getUsuarioByCorreo(correo: string): Observable<any> {
    console.log("Correo:", correo);
    return this.http.get<any>(`${this.apiUrl}/correo/${correo}`);
  }

  createUsuario(usuario: any): Observable<any> {
    console.log("Creando usuario:", usuario);
    return this.http.post<any>(this.apiUrl, usuario);
  }

  updateUsuario(id: number, usuario: any): Observable<any> {
    console.log("Actualizando usuario:", id, usuario);
    return this.http.put<any>(`${this.apiUrl}/${id}`, usuario);
  }

  deleteUsuario(id: number): Observable<any> {
    console.log("Eliminando usuario:", id);
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
