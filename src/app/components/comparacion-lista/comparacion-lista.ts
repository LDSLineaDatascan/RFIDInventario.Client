import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComparacionApi, ComparacionInventario } from '../../services/comparacion-api';
import { TiendaApi, Tienda } from '../../services/tienda-api';
import { SignalRService } from '../../services/signalr-api';
import { ActivatedRoute } from '@angular/router'; 
import { Router } from '@angular/router';
import { Location } from '@angular/common';


@Component({
  selector: 'app-comparacion-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comparacion-lista.html',
  styleUrl: './comparacion-lista.css'
})
export class ComparacionLista implements OnInit {
  comparacion: ComparacionInventario[] = [];
  tiendas: Tienda[] = [];
  idTienda = '';
  error: string | null = null;
  progresoLectura = 0;

  pageSize: number = 10;
  currentPage: number = 1;
  Math = Math;

  constructor(private comparacionApi: ComparacionApi, private tiendaApi: TiendaApi,
      private signalRService: SignalRService, private route: ActivatedRoute,
    private router: Router, private location: Location,) {}

  ngOnInit(): void {
  // 1️.obtengo usuario del localStorage
  const usuarioStr = localStorage.getItem('usuarioSesion');
  let usuario = null;
  if (usuarioStr) {
    try {
      usuario = JSON.parse(usuarioStr);
      console.log('👤 Usuario de sesión:', usuario);
    } catch (e) {
      console.error('Error al parsear usuarioSesion:', e);
    }
  }

  // 2️. leo tienda en queryParams
  this.route.queryParams.subscribe(params => {
    const tiendaParam = params['idTienda'];

    // 3. cargo segun rol
    this.tiendaApi.obtenerTiendas().subscribe({
      next: (data) => {
        let tiendasFiltradas = data;

        // if user muestro las asigandas
        if (usuario && usuario.rol === 'User' && usuario.tiendasAsignadas?.length > 0) {
          const codigosAsignados = usuario.tiendasAsignadas.map((t: any) => t.codigo);
          tiendasFiltradas = data.filter(t => codigosAsignados.includes(t.codigo));
          console.log('🏬 Tiendas filtradas por rol User:', tiendasFiltradas);
        }

        this.tiendas = tiendasFiltradas;

        // 4️. selecciono tioenda desde url o primera disponible segun el user
        if (this.tiendas.length > 0) {
          this.idTienda = tiendaParam || this.tiendas[0].codigo;
          this.obtenerComparacion();
        } else {
          this.error = 'No tienes tiendas asignadas.';
          console.warn('⚠️ Sin tiendas disponibles para este usuario.');
        }
      },
      error: (err) => {
        this.error = 'Error al cargar las tiendas';
        console.error(err);
      }
    });
  });

  // 5. eventos de SignalR
  this.signalRService.onActualizarDatos = () => {
    console.log("🔄 Actualizando datos de comparación...");
    this.obtenerComparacion();
  };
}


  /*cargarTiendas(): void {
    this.tiendaApi.obtenerTiendas().subscribe({
      next: (data) => {
        this.tiendas = data;
        if (this.tiendas.length > 0) {
          this.idTienda = this.tiendas[0].codigo;
          this.obtenerComparacion();
        }
      },
      error: (err) => {
        this.error = 'Error al cargar las tiendas';
        console.error(err);
      }
    });
  }*/

  cargarTiendas(tiendaParam?: string): void {
  this.tiendaApi.obtenerTiendas().subscribe({
    next: (data) => {
      this.tiendas = data;
      if (this.tiendas.length > 0) {
        this.idTienda = tiendaParam || this.tiendas[0].codigo;
        this.obtenerComparacion();
      }
    },
    error: (err) => {
      this.error = 'Error al cargar las tiendas';
      console.error(err);
    }
  });
}





  obtenerComparacion(): void {
    this.comparacionApi.obtenerComparacionPorTienda(this.idTienda).subscribe({
      next: (data) => {
        this.comparacion = data;
        this.error = null;
        this.calcularProgreso();
      },
      error: (err) => {
        this.error = 'Error al cargar la comparación';
        console.error(err);
      }
    });
  }

  calcularProgreso(): void {
    
    const teoricoFiltrado = this.comparacion.filter(item => item.stockTeorico > 0);
    const totalTeorico = teoricoFiltrado.reduce((sum, item) => sum + item.stockTeorico, 0);

    const totalFisico = teoricoFiltrado.reduce((sum, item) => sum + Math.min(item.stockFisico, item.stockTeorico), 0);
  
    if (totalTeorico === 0) {
      this.progresoLectura = 0;
    } else {
      this.progresoLectura = Math.min(100, Math.round((totalFisico / totalTeorico) * 100));
    }
  }

  descargarArchivoPlano(): void {
    if (this.comparacion.length === 0) return;

    let contenido = 'ID Producto;Producto;Categoría;Stock Teórico;Stock Físico;Diferencia;Estado\n';
    this.comparacion.forEach(item => {
      contenido += `${item.idProducto};${item.nombre};${item.categoria};${item.stockTeorico};${item.stockFisico};${item.diferencia};${item.estado}\n`;
    });

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `comparacion_${this.idTienda}.txt`;
    link.click();
  }

 volver(): void {
    if (!this.idTienda) {
    alert('ID de tienda no definido.');
    return;
  }

  this.router.navigate(['/inventario/categorias'], {
    queryParams: { idTienda: this.idTienda }
  });
  }

  // Paginación
  getcomparacionPaginada(){
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.comparacion.slice(startIndex, startIndex + this.pageSize);
  }

  nextPage(){
    if((this.currentPage * this.pageSize) < this.comparacion.length){
      this.currentPage++;
    }
  }

  prevPage(){
    if(this.currentPage > 1){
      this.currentPage--;
    }
  }

}
