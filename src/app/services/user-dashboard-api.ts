import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AppConfigService } from './app-config-service';

@Injectable({
  providedIn: 'root'
})
export class UserDashboardServices {
  //private apiUrl = 'http://localhost:5097/api/UsuarioTienda'; // reutiliza controlador existente
  //private apiUrl = `${environment.API_URL}/api/UsuarioTienda`;
  private apiUrl: string = '';

  constructor(private http: HttpClient, private appConfigService: AppConfigService) {
    const apiUrl = this.appConfigService.get<string>('API_URL', `${environment.API_URL}`);
    this.apiUrl = `${apiUrl}/api/UsuarioTienda`;
    console.log("API URL UserDashboard con config:", this.apiUrl);
  }

  getTiendasPorUsuario(usuarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }
}
