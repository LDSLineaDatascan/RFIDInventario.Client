import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventarioApi, InventarioTeorico } from '../../services/inventario-api';
import { TiendaApi, Tienda } from '../../services/tienda-api';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-inventario-teorico-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario-teorico-lista.html',
  styleUrl: './inventario-teorico-lista.css'
})
export class InventarioTeoricoLista implements OnInit {
  inventario: InventarioTeorico[] = [];
  tiendas: Tienda[] = [];
  idTienda = ''; 
  error: string | null = null;
  progresoTeorico: number = 0;


  constructor(private inventarioApi: InventarioApi, private tiendaApi: TiendaApi) {}

  ngOnInit(): void {
    //this.obtenerInventario();
    this.cargarTiendas();
  }

  cargarTiendas(): void 
  {
    this.tiendaApi.obtenerTiendas().subscribe({
      next: (data) => {
        this.tiendas = data;
        if (this.tiendas.length > 0) {
          this.idTienda = this.tiendas[0].codigo; // Selecciona la primera tienda por defecto
          this.obtenerInventario();
          
        }
      },
      error: (err) => {
        this.error = 'Error al cargar las tiendas';
        console.error(err);
      }
    });
  }

  obtenerInventario(): void {
    this.inventarioApi.obtenerInventarioPorTienda(this.idTienda).subscribe({
      next: (data) => {
        this.inventario = data;
        this.error = null;
        this.calcularProgreso();
        
      },
      error: (err) => {
        this.error = 'Error al cargar el inventario';
        console.error(err);
      }
    });
  }

  calcularProgreso(): void {
  const inventarioConCantidad = this.inventario.filter(item => item.cantidad > 0);
  const totalTeorico = inventarioConCantidad.reduce((sum, item) => sum + item.cantidad, 0);
  const totalLeido = inventarioConCantidad.reduce((sum, item) => sum + Math.min(item.cantidadLectura, item.cantidad), 0);

  if (totalTeorico === 0) {
    this.progresoTeorico = 0;
  } else {
    this.progresoTeorico = Math.min(100, Math.round((totalLeido / totalTeorico) * 100));
  }
}

descargarCSV(): void {
  if (this.inventario.length === 0) return;

  let contenido = 'ID Producto;Tienda;Producto;Categoría;Stock Teórico;Stock Físico\n';
  this.inventario.forEach(item => {
    contenido += `${item.idProducto};${item.tienda};${item.producto};${item.categoria};${item.cantidad};${item.cantidadLectura}\n`;
  });

  const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `inventario_teorico_${this.idTienda}.txt`;
  link.click();
}


  
}
