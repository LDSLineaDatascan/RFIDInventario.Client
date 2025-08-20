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

  constructor(private comparacionApi: ComparacionApi, private tiendaApi: TiendaApi,
      private signalRService: SignalRService, private route: ActivatedRoute,
    private router: Router, private location: Location,) {}

  ngOnInit(): void {
    //this.cargarTiendas();
    this.route.queryParams.subscribe(params => {
    const tiendaParam = params['idTienda'];
    this.cargarTiendas(tiendaParam);
  });


    this.signalRService.onActualizarDatos = () => {
    console.log("Actualizando datos de comparación...");
    this.obtenerComparacion();  // <--- Método que refresca los datos
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

}
