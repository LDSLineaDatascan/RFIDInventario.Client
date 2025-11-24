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

  //filtro usuario
  usuariosFiltrados: any[]=[];

  //filtro tiendas
  tiendasFiltradas: any[] = [];
  filtroTiendaCodigo: string = '';

  //estadotiendas
  tiendasDisponibles: any[] = []; 
  tiendaSeleccionadaCodigo: string = '';
  nuevoEstadoTienda: string = 'Abierto';

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
      this.usuariosFiltrados=data;
    });

    //2. incio conexion signalR
    this.signalRService.iniciarConexion();

    //3. escucho eventos de usuarios
    this.signalRService.escucharEvento('UsuarioEliminado',(id: number) => {
      this.usuarios = this.usuarios.filter(u => u.id !== id);
      console.log("Usuario eliminado:", id)
    });

    //4. Creo usuario
    this.signalRService.escucharEvento('UsuarioCreado',(usuario: any) => {
      this.usuarios.push(usuario);
      console.log("Usuario creado:", usuario)
    });

    //5. Actualizousuario
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

    //9.estado tenda
    this.adminDashboardService.getTiendas().subscribe(t => {
    this.tiendasDisponibles = t;
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

  /*eliminarUsuario(id: number) {
    this.adminDashboardService.deleteUsuario(id).subscribe(() => {
      this.usuarios = this.usuarios.filter(x => x.id !== id);
    });
  }*/
  eliminarUsuario(id: number) {
    if (!confirm("¿Está seguro de eliminar este usuario?")) return;
    this.adminDashboardService.deleteUsuario(id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(x => x.id !== id); 
        alert("Usuario eliminado exitosamente.");
      },
      error: (err) => {
        console.error("Error al eliminar usuario:", err);

        //detectar error foreing key
        if(err.error.includes("FK_USUARIOS_TIENDAS_USUARIOS")){
          alert("No se puede eliminar el usuario porque tiene tiendas asignadas. Primero desasigne las tiendas.");
        }else{
          alert("Error al eliminar usuario. Usuario asociado a tiendas.");
        }
      }
    });
  }

  guardarCambios() {
    if (!this.usuarioEncontrado) return;
    this.adminDashboardService.updateUsuario(this.usuarioEncontrado.id, this.usuarioEncontrado)
      .subscribe(() => {
       
        const index = this.usuarios.findIndex(u => u.id === this.usuarioEncontrado?.id);
        if (index !== -1) {
          this.usuarios[index] = { ...this.usuarioEncontrado };
        }
      });
  }

  editarUsuario(u: any) {
  
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

  filtrarUsuarios() {
  const filtro = this.filtroCorreo.toLowerCase().trim();
  if (!filtro) {
    this.usuariosFiltrados = this.usuarios;
    return;
  }

  this.usuariosFiltrados = this.usuarios.filter(u =>
    u.correo.toLowerCase().includes(filtro)
  );

  this.usuariosFiltrados = this.usuarios.filter(u =>
  u.correo.toLowerCase().includes(filtro) 
  //u.nombre.toLowerCase().includes(filtro) 
  //u.rol.toLowerCase().includes(filtro)
  );
}


//Estado tiendas**
//abrir modal edición tienda
abrirModalEditarEstado(tiendaCodigo?: string) {
  this.tiendaSeleccionadaCodigo = tiendaCodigo || '';
  const tienda = this.tiendasDisponibles.find(t => t.codigo === tiendaCodigo);
  if (tienda) this.nuevoEstadoTienda = tienda.estado || 'Abierto';
}
  
// guardar estado
guardarEstadoTienda() {
  if (!this.tiendaSeleccionadaCodigo) { alert('Seleccione una tienda'); return; }

  this.adminDashboardService.cambiarEstadoTienda(this.tiendaSeleccionadaCodigo, this.nuevoEstadoTienda)
    .subscribe({
      next: () => {
        // actualizo UI local
        const t = this.tiendasDisponibles.find(x => x.codigo === this.tiendaSeleccionadaCodigo);
        if (t) t.estado = this.nuevoEstadoTienda;
        // notificar por signalR para que se unan al grupo y reciban Cerrar/Reiniciar
        alert('Estado actualizado');
      },
      error: (err) => {
        console.error(err);
        alert('Error actualizando estado');
      }
    });
}

}
