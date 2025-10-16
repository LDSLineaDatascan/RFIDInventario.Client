import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserDashboardServices {
  private apiUrl = 'http://localhost:80/api/UsuarioTienda'; // reutiliza controlador existente

  constructor(private http: HttpClient) {}

  getTiendasPorUsuario(usuarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }
}
