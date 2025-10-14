import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserDashboardServices } from '../../services/user-dashboard-api';
import { AuthApi } from '../../services/auth-api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css']
})
export class UserDashboard implements OnInit {
  usuarioSesion: any | null = null;
  tiendasAsignadas: any[] = [];
  filtroTienda: string = '';

  constructor(
    private userDashboardService: UserDashboardServices,
    private authApi: AuthApi,
    private router: Router
  ) {}

  /*ngOnInit(): void {
    // Recupera usuario de sesión
    const usuarioSesion = localStorage.getItem("usuarioSesion");
    if (usuarioSesion) {
      this.usuarioSesion = JSON.parse(usuarioSesion);
      console.log("Usuario de sesión:", this.usuarioSesion);
    }

    // Obtengo tiendas asignadas al usuario 
    if (this.usuarioSesion) {
      this.userDashboardService
        .getTiendasPorUsuario(this.usuarioSesion.id)
        .subscribe((data) => {
          this.tiendasAsignadas = data;
          console.log("Tiendas asignadas:", data);
        });
    }
  }*/

    ngOnInit(): void {
  // Recupero usuario de sesión
  const usuarioSesion = localStorage.getItem("usuarioSesion");
  if (usuarioSesion) {
    this.usuarioSesion = JSON.parse(usuarioSesion);
    console.log("Usuario de sesión:", this.usuarioSesion);
  }

  // Obtengo tiendas asignadas al usuario 
  if (this.usuarioSesion) {
    this.userDashboardService
      .getTiendasPorUsuario(this.usuarioSesion.id)
      .subscribe((data) => {
        this.tiendasAsignadas = data;
        console.log("Tiendas asignadas:", data);

        // agrego tiendas asignadas
        this.usuarioSesion.tiendasAsignadas = this.tiendasAsignadas.map(t => ({
          codigo: t.tiendaCodigo,
          rolAsignado: t.rolAsignado
        }));

        // guardo usuario en localstorage
        localStorage.setItem("usuarioSesion", JSON.stringify(this.usuarioSesion));

        console.log("Usuario actualizado en localStorage nuevo:", this.usuarioSesion);
      });
  }
}


  logout() {
    this.authApi.logout();
    localStorage.removeItem("usuarioSesion");
    this.router.navigate(['/']);
  }

  get tiendasFiltradas() {
    if (!this.filtroTienda.trim()) return this.tiendasAsignadas;
    return this.tiendasAsignadas.filter(t =>
      t.tiendaCodigo.toLowerCase().includes(this.filtroTienda.toLowerCase())
    );
  }
}
