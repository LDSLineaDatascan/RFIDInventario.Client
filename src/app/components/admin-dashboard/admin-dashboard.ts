import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardService } from '../../services/admin-dashboard-api';
import { SignalRService } from '../../services/signalr-api';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApi } from '../../services/auth-api';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
  standalone: true
})
export class AdminDashboard implements OnInit {
  usuarios: any[] = [];

  ///propiedades para filtrar correo
  filtroCorreo: string = '';
  usuarioEncontrado: any | null = null;
  usuarioSesion: any | null = null;

  //propiedades para asignar tiendas  
  tiendasUsuario: any[] = [];
  nuevaTiendaCodigo: string="";
  nuevoRolAsignado: string ="";

  constructor(
    private adminDashboardService: AdminDashboardService,
    private signalRService: SignalRService,
    private router: Router,
    private authApi: AuthApi
  ) { }

  ngOnInit(): void {
    //1. cargo usuarios con api rest
    this.adminDashboardService.getUsuarios().subscribe(data => {
      
      this.usuarios = data;
      console.log("Usuarios: ",data);
    });

    //2. incio conexion signalR
    this.signalRService.iniciarConexion();

    //3. escucho eventos de usuarios
    this.signalRService.escucharEvento('UsuarioEliminado',(id: number) => {
      this.usuarios = this.usuarios.filter(u => u.id !== id);
      console.log("Usuario eliminado:", id)
    });

    //4. Crear usuario
    this.signalRService.escucharEvento('UsuarioCreado',(usuario: any) => {
      this.usuarios.push(usuario);
      console.log("Usuario creado:", usuario)
    });

    //5. Actualizar usuario
    this.signalRService.escucharEvento('UsuarioActualizado',(usuario: any) => {
      const index = this.usuarios.findIndex(u => u.id === usuario.id);
      if (index !== -1) {
        this.usuarios[index] = usuario;
      }
      console.log("Usuario actualizado:", usuario)
    });

    //6. recupero datos de sesión
    const usuarioSesion = localStorage.getItem("usuarioSesion");
    if (usuarioSesion) {
      this.usuarioSesion = JSON.parse(usuarioSesion);
      console.log("Usuario de sesión recuperado:", this.usuarioSesion);
    }

    //7. signalR: escuchar cuanod se asigne una tienda en cualquier panel
    this.signalRService.escucharEvento('TiendaAsignada', (asignacion: any)=>{
      console.log("tienda asignada comunica signalR", asignacion);

      //si usuario es el mismo al que se asigno la tienda
      if(this.usuarioEncontrado && asignacion.usuarioid === this.usuarioEncontrado.id)
      {
        const existe= this.tiendasUsuario.some(t => t.id === asignacion.id);
        if(!existe){
          this.tiendasUsuario.push(asignacion);
        }
      }
    });

    //8. escuchar desasignación
    this.signalRService.escucharEvento('TiendaDesasignada', (id: number) => {
      console.log("Tienda desasignada (SignalR):", id);
      this.tiendasUsuario = this.tiendasUsuario.filter(t => t.id !== id);
    });

  }

  buscarPorCorreo() {
    if (!this.filtroCorreo.trim()) return;
    this.adminDashboardService.getUsuarioByCorreo(this.filtroCorreo).subscribe({
      next: (usuario) => {
        this.usuarioEncontrado = usuario;
        console.log("Usuario encontrado:", usuario);
      },
      error: (err) => {
        this.usuarioEncontrado = null;
        console.error("No se encontró usuario:", err);
      }
    });
  }

  eliminarUsuario(id: number) {
    this.adminDashboardService.deleteUsuario(id).subscribe(() => {
      this.usuarios = this.usuarios.filter(x => x.id !== id);
    });
  }

  guardarCambios() {
    if (!this.usuarioEncontrado) return;
    this.adminDashboardService.updateUsuario(this.usuarioEncontrado.id, this.usuarioEncontrado)
      .subscribe(() => {
        // Actualización ya se reflejará por SignalR, 
        // pero opcionalmente puedes refrescar manual:
        const index = this.usuarios.findIndex(u => u.id === this.usuarioEncontrado?.id);
        if (index !== -1) {
          this.usuarios[index] = { ...this.usuarioEncontrado };
        }
      });
  }

  editarUsuario(u: any) {
  // Clonamos el usuario para no modificar directamente la lista
  this.usuarioEncontrado = { ...u };
  }

  logout() {
 console.log("Cerrando sesión desde dashboard...");
  this.authApi.logout();
  localStorage.removeItem("usuarioSesion");
  this.router.navigate(['/']);
  }

  //****************************************asignacion de tiendas***************************************//
  verTiendaUsuario(usuario:any)
  {
    this.usuarioEncontrado=usuario;
    this.adminDashboardService.getTiendasPorUsuario(usuario.id).subscribe(data => {
    this.tiendasUsuario = data;});
  }

  asignarTienda() {
  if (!this.nuevaTiendaCodigo || !this.nuevoRolAsignado) return;

  if (!this.usuarioSesion) {
    alert("No se encontró usuario de sesión");
    return;
  }

  this.adminDashboardService.asignarTienda(
    this.usuarioEncontrado.id,
    this.nuevaTiendaCodigo,
    this.nuevoRolAsignado,
    this.usuarioSesion.id 
  ).subscribe({
    next: () => {
      this.adminDashboardService.getTiendasPorUsuario(this.usuarioEncontrado.id).subscribe(data =>{
        this.tiendasUsuario=data;
      });

      //this.tiendasUsuario.push(asignacion);
      this.nuevaTiendaCodigo = '';
      this.nuevoRolAsignado = 'User';
    },
    error: (err) => {
      alert(err.error?.message || "Error al asignar tienda");
    }
  });
}

  desasignarTienda(tienda: any) {
    this.adminDashboardService.desasignarTienda(
    this.usuarioEncontrado.correo, //usuarioid
    tienda.tiendaCodigo
  ).subscribe(() => {
    this.tiendasUsuario = this.tiendasUsuario.filter(x => x !== tienda);});
  }
  

}
