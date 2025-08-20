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


  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private detalleApi: ProductoDetalleApi,
    private signalRService: SignalRService
  ) {}

  ngOnInit(): void {
    this.idTienda = this.route.snapshot.paramMap.get('idTienda')!;
    this.idProducto = this.route.snapshot.paramMap.get('idProducto')!;

    this.detalleApi.getDetalleProducto(this.idTienda, this.idProducto)
      .subscribe(data => {
        this.detalle = data;
        console.log('Detalle de producto:', data);
      });

    this.signalRService.onProductoReinicio = (productoReiniciado) =>{
      if(productoReiniciado === this.idProducto) {
        console.log('El inventario del producto ha sido reiniciado desde SignalR:', productoReiniciado);
        this.detalleApi.getDetalleProducto(this.idTienda, this.idProducto)
        .subscribe(data => this.detalle =data);
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
      //this.detalle.progreso
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
        this.tags = data.slice(0, this.detalle.stockTeorico);//primers tags iguales al inv teorico
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
          this.ngOnInit(); // Recargar los detalles del producto
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
      this.detalle = data;
      console.log('Detalle actualizado del producto:', data);
    });
}

  get progresoLimitado(): number {
  if (!this.detalle?.progreso) return 0;
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
    default:
      break;
  }
}






}
