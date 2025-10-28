import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductoDetalleApi } from '../../services/inventario-producto-detalle-api';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb';
import { SignalRService } from '../../services/signalr-api'; 

@Component({
  selector: 'app-inventario-producto-detalle',
  templateUrl: './inventario-producto-detalle.html',
  styleUrls: ['./inventario-producto-detalle.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent]
})
export class InventarioProductoDetalleComponent implements OnInit {

  idTienda!: string;
  idProducto!: string;
  detalle: any;
  tags: any[] = [];
  tituloTags: string = 'Tags del producto';

  pageSize: number = 10;
  currentPage: number = 1;
  Math = Math; 

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private detalleApi: ProductoDetalleApi,
    private signalRService: SignalRService
  ) {}

  ngOnInit(): void {
    this.idTienda = this.route.snapshot.paramMap.get('idTienda')!;
    this.idProducto = this.route.snapshot.paramMap.get('idProducto')!;

    //usar la función con el cálculo corregido desde el inicio
    this.cargarDetalleProducto();

    //eliminado: esta parte duplicaba la carga sin el cálculo corregido
    /*
    this.detalleApi.getDetalleProducto(this.idTienda, this.idProducto)
      .subscribe(data => {
        this.detalle = data;
        console.log('Detalle de producto:', data);
      });
    */

    this.signalRService.onProductoReinicio = (productoReiniciado) =>{
      if(productoReiniciado === this.idProducto) {
        console.log('El inventario del producto ha sido reiniciado desde SignalR:', productoReiniciado);
        //cambiado
        this.cargarDetalleProducto();
      }
    };

    this.signalRService.onActualizarDatos=()=>{
      console.log('Producto actualizado');
      this.cargarDetalleProducto();
    }
  }

  volver(): void {
    this.location.back();
  }

  descargarCSV(): void {
    if (!this.detalle) {
      alert('No hay datos para exportar.');
      return;
    }

    const encabezados = ['Código', 'Nombre', 'Categoría', 'Stock Teórico', 'Stock Físico', 'Faltantes', 'Sobrantes', 'Progreso (%)'];
    const fila = [
      this.detalle.idProducto,
      this.detalle.producto,
      this.detalle.categoria,
      this.detalle.stockTeorico,
      this.detalle.stockFisico,
      this.detalle.faltantes,
      this.detalle.sobrantes,
      Math.min(this.detalle.progreso, 100)
    ];

    const csvContent = [encabezados, fila].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `detalle_producto_${this.idProducto}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  ver_tags(): void {
    this.detalleApi.getTagsProducto(this.idTienda, this.idProducto).subscribe({
      next: (data) => {
        this.tags = data;
        console.log('Tags del producto:', data);
        this.tituloTags = 'Todos los tags leídos del producto';
      },
      error: (err) => {
        console.error('Error al obtener los tags:', err);
        alert('Error al cargar los tags del producto.');
      }
    });
  }

  ver_tags_teoricos(): void {
    this.detalleApi.getTagsProducto(this.idTienda, this.idProducto).subscribe({
      next: (data) => {
        this.tags = data.slice(0, this.detalle.stockTeorico);
        console.log('Tags teóricos del producto:', data);
        this.tituloTags = 'Tags teóricos del producto';
      },
      error: (err) => {
        console.error('Error al obtener los tags teóricos:', err);
        alert('Error al cargar los tags teóricos del producto.');
      }
    });    
  }

  ver_tags_sobrantes(): void {
    this.detalleApi.getTagsProducto(this.idTienda, this.idProducto).subscribe({
      next: (data) => {
        this.tags = data.slice(this.detalle.stockTeorico, this.detalle.stockTeorico + this.detalle.sobrantes);
        console.log('Tags sobrantes del producto:', data);
        this.tituloTags = 'Tags sobrantes del producto';
      },
      error: (err) => {
        console.error('Error al obtener los tags sobrantes:', err);
        alert('Error al cargar los tags sobrantes del producto.');
      }
    });
  }

  reiniciarInventario(producto: any): void{
    if(!producto || !producto.idProducto || !producto.idTienda) return;

    if(!confirm('¿Está seguro de que desea reiniciar el inventario de productos?')) return;

    this.detalleApi.reiniciarInventario(producto.idTienda, producto.idProducto)
      .subscribe({
        next: (res) =>{
          alert('Inventario reiniciado exitosamente.');
          this.ngOnInit();
        },
        error: (err) =>{
          console.error('Error al reiniciar el inventario:', err);
          alert('Error al reiniciar el inventario. Por favor, inténtelo de nuevo más tarde.');
        }
      });
  }

  cargarDetalleProducto(): void {
    this.detalleApi.getDetalleProducto(this.idTienda, this.idProducto)
      .subscribe(data => {
        const stockTeorico = data.stockTeorico ?? 0;
        const stockFisico = data.stockFisico ?? 0;

        data.esAdicional = stockTeorico === 0;
        data.faltantes = Math.max(stockTeorico - stockFisico, 0);
        data.sobrantes = !data.esAdicional ? Math.max(stockFisico - stockTeorico, 0) : 0;
        data.adicionales = data.esAdicional ? stockFisico : 0;

        this.detalle = data;
        console.log('Detalle ajustado del producto:', this.detalle);
      });
  }

  get progresoLimitado(): number {
    //if (!this.detalle?.progreso) return 0;
    //return Math.min(this.detalle.progreso, 100);
    if (!this.detalle) return 0;
    if (this.detalle.esAdicional) return 0;
    if (!this.detalle.progreso) return 0;
    return Math.min(this.detalle.progreso, 100);
  }

  manejarSeleccionTags(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const opcion = selectElement.value;

    switch (opcion) {
      case 'todos':
        this.ver_tags();
        break;
      case 'teoricos':
        this.ver_tags_teoricos();
        break;
      case 'sobrantes':
        this.ver_tags_sobrantes();
        break;
      case 'adicionales':
        this.ver_tags_adicionales();
        break;
      default:
        break;
    }
  }

  get tagsPaginados(){
    const startIndex = (this.currentPage -1) * this.pageSize;
    return this.tags.slice(startIndex, startIndex + this.pageSize);
  }

  nextPage(){
    if(this.currentPage * this.pageSize < this.tags.length){
      this.currentPage++;
    }
  }

  prevPage(){
    if(this.currentPage >1){
      this.currentPage--;
    }
  }

  ver_tags_adicionales(): void {
    this.detalleApi.getTagsProducto(this.idTienda, this.idProducto).subscribe({
      next: (data) => {
        if (this.detalle.stockTeorico === 0) {
          this.tags = data;
        } else {
          const inicio = this.detalle.stockTeorico + this.detalle.sobrantes;
          this.tags = data.slice(inicio);
        }

        console.log('Tags adicionales del producto:', this.tags);
        this.tituloTags = 'Tags adicionales del producto';
      },
      error: (err) => {
        console.error('Error al obtener los tags adicionales:', err);
        alert('Error al cargar los tags adicionales del producto.');
      }
    });
  }

}
