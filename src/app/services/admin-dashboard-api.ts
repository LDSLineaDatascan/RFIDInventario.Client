import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { SignalRService } from './signalr-api';
import { environment } from '../../environments/environment';
//config.json
import { AppConfigService } from './app-config-service';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {

  private envUrl = `${environment.API_URL}/api/usuarios`;
  //config.json
  private apiUrl: string = '';
  private apiUrlUsuarioTienda: string = '';
  private apiGetTiendasUrl: string = '';
  
  constructor(private http: HttpClient, private appConfigService: AppConfigService) {
    const baseUrl = this.appConfigService.get<string>('API_URL', this.envUrl);
    this.apiUrl= `${baseUrl}/api/usuarios`;
    console.log("API URL AdminDashboard con config:", this.apiUrl);

    this.apiUrlUsuarioTienda = `${baseUrl}/api/UsuarioTienda`;
    console.log("API URL UsuarioTienda con config:", this.apiUrlUsuarioTienda);

    this.apiGetTiendasUrl = `${baseUrl}`;
    console.log("API URL Tiendas con config:", this.apiGetTiendasUrl);
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
  //return this.http.get<any[]>(`${environment.API_URL}/api/UsuarioTienda/usuario/${usuarioId}`);
  return this.http.get<any[]>(`${this.apiUrlUsuarioTienda}/usuario/${usuarioId}`);
}

asignarTienda(usuarioId: number, tiendaCodigo: string, rol: string, asignadoPorId: number): Observable<any> {
  return this.http.post<any>(`${this.apiUrlUsuarioTienda}/asignar`, {
  //return this.http.post<any>(`${environment.API_URL}/api/UsuarioTienda/asignar`, {
    usuarioId,
    tiendaCodigo,
    rolAsignado: rol,
    asignadoPorId
  });
}

desasignarTienda(usuarioCorreo: string, tiendaCodigo: string): Observable<any> {
  return this.http.delete<any>(`${this.apiUrlUsuarioTienda}/correo?correoUsuario=${usuarioCorreo}&tiendaCodigo=${tiendaCodigo}`
  //return this.http.delete<any>(`${environment.API_URL}/api/UsuarioTienda/correo?correoUsuario=${usuarioCorreo}&tiendaCodigo=${tiendaCodigo}`
  ).pipe(
    tap(() => console.log("Desasignando tienda:", usuarioCorreo, tiendaCodigo))
  );
}

//estado tiendas
getTiendas(): Observable<any[]> {
  const url = `${this.apiGetTiendasUrl}/tiendas`; // ajusta según tu baseUrl
  return this.http.get<any[]>(url);
}

cambiarEstadoTienda(tiendaCodigo: string, estado: string): Observable<any> {
  const url = `${this.apiGetTiendasUrl}/tiendas/${encodeURIComponent(tiendaCodigo)}/estado`;
  return this.http.put<any>(url, { estado });
}


}
