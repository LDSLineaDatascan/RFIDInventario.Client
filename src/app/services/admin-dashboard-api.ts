import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { SignalRService } from './signalr-api';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {

  private apiUrl = `${environment.API_URL}/api/usuarios`;
  

  constructor(private http: HttpClient) {
    console.log("API URL:", this.apiUrl);
   }

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

  //asignar tiedas
  getTiendasPorUsuario(usuarioId: number): Observable<any[]> {
  return this.http.get<any[]>(`${environment.API_URL}/api/UsuarioTienda/usuario/${usuarioId}`);
}

asignarTienda(usuarioId: number, tiendaCodigo: string, rol: string, asignadoPorId: number): Observable<any> {
  return this.http.post<any>(`${environment.API_URL}/api/UsuarioTienda/asignar`, {
    usuarioId,
    tiendaCodigo,
    rolAsignado: rol,
    asignadoPorId
  });
}

desasignarTienda(usuarioCorreo: string, tiendaCodigo: string): Observable<any> {
  return this.http.delete<any>(
    `${environment.API_URL}/api/UsuarioTienda/correo?correoUsuario=${usuarioCorreo}&tiendaCodigo=${tiendaCodigo}`
  ).pipe(
    tap(() => console.log("Desasignando tienda:", usuarioCorreo, tiendaCodigo))
  );
}
}
