import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InventarioCategoriaDetalleApi } from '../../services/inventario-categoria-detalle-api';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb';
import { SignalRService } from '../../services/signalr-api'; 



@Component({
  selector: 'app-inventario-categoria-detalle',
  templateUrl: './inventario-categoria-detalle.html',
  styleUrls: ['./inventario-categoria-detalle.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent ]
})
export class InventarioCategoriaDetalleComponent implements OnInit {

  idTienda!: string;
  categoria!: string;
  productos: any[] = [];
  rutas = [
  { label: 'Categorías', link: ['/inventario', 'categorias'] },
  { label: this.categoria, link: ['/inventario', 'categorias', this.categoria] }
  ];


  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private detalleApi: InventarioCategoriaDetalleApi,   // inyecto servicio
    private router: Router,
    private signalRService: SignalRService
  ) {}

  /*ngOnInit(): void {
    this.idTienda = this.route.snapshot.paramMap.get('idTienda')!;
    this.categoria = this.route.snapshot.paramMap.get('categoria')!;

    this.rutas=[
      { label: 'Categorías', link: ['/categorias'] },
      { label: this.categoria, link: ['/categorias', this.categoria] }
    ];
    
    this.detalleApi.obtenerProductosPorCategoria(this.idTienda, this.categoria)
      .subscribe(data => {
        this.productos = data;
        console.log('Productos por categoría:', data);
      });
  }*/


  ngOnInit(): void {
  this.idTienda = this.route.snapshot.paramMap.get('idTienda')!;
  this.categoria = this.route.snapshot.paramMap.get('categoria')!;

  //  Guardar categoría en sessionStorage
  if (this.categoria) {
    sessionStorage.setItem('categoriaSeleccionada', this.categoria);
  }

  this.rutas = [
    { label: 'Categorías', link: ['/categorias'] },
    { label: this.categoria, link: ['/categorias', this.categoria] }
  ];
  
  this.detalleApi.obtenerProductosPorCategoria(this.idTienda, this.categoria)
    .subscribe(data => {
      this.productos = data;
      console.log('Productos por categoría:', data);
    });

    this.signalRService.onCategoriaReinicio = (categoriaReiniciada) => {
    if (categoriaReiniciada === this.categoria) {
      console.log('Categoría reiniciada desde SignalR:', categoriaReiniciada);
      this.detalleApi.obtenerProductosPorCategoria(this.idTienda, this.categoria)
        .subscribe(data => this.productos = data);
      }
    };

    //actualizacion
    this.signalRService.onActualizarDatos = () => {
    console.log("Actualizando datos de comparación...");
    this.cargarProductos();  // <--- Método que refresca los datos
  };
}


  volver(): void {
    this.location.back();
  }

  verDetalleProducto(codigo: string): void {
    //console.log('Ver detalle de producto', codigo);
    this.router.navigate(['/producto-detalle', this.idTienda, codigo]);
  }


  descargarCSVDetalle(): void {
  if (!this.productos || this.productos.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const encabezados = ['Código', 'Nombre', 'Categoría', 'Stock Teórico', 'Stock Físico', 'Faltantes', 'Sobrantes', 'Progreso'];
  const filas = this.productos.map(p => {
    const faltantes = Math.max((p.stockTeorico ?? 0) - (p.stockFisico ?? 0), 0);
    const sobrantes = Math.max((p.stockFisico ?? 0) - (p.stockTeorico ?? 0), 0);
    const progreso = p.stockTeorico > 0
      ? Math.min((p.stockFisico / p.stockTeorico) * 100, 100).toFixed(0) + '%'
      : '0%';

    return [
      p.idProducto || '',     
      p.producto || '',       
      p.categoria || '',      
      p.stockTeorico ?? '',   
      p.stockFisico ?? '',    
      faltantes,              
      sobrantes,              
      progreso                
    ];
  });

  const csvContent = [encabezados, ...filas]
    .map(e => e.join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `detalle_categoria_${this.categoria}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

reiniciarInventarioCategoria(): void {
  if (confirm(`¿Está seguro de reiniciar el inventario de la categoría ${this.categoria}?`)) {
    this.detalleApi.reiniciarInventarioCategoria(this.idTienda, this.categoria).subscribe({
      next: () => {
        alert('Inventario de la categoría reiniciado correctamente.');
        // Recargar los productos
        this.detalleApi.obtenerProductosPorCategoria(this.idTienda, this.categoria)
          .subscribe(data => this.productos = data);
      },
      error: (err) => {
        console.error(err);
        alert('Error al reiniciar inventario de la categoría');
      }
    });
  }
}

getPorcentaje(stockFisico: number, stockTeorico: number): number {
  if (stockTeorico <= 0) return 0;
  return Math.min((stockFisico / stockTeorico) * 100, 100);
}

cargarProductos(): void {
  this.detalleApi.obtenerProductosPorCategoria(this.idTienda, this.categoria)
    .subscribe(data => {
      this.productos = data;
      console.log('Productos actualizados:', data);
    });
}



}
