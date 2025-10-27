import { Component, OnInit } from '@angular/core';
import { Producto, ProductoApi } from '../../services/producto-api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-producto-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto-lista.html',
  styleUrl: './producto-lista.css'
})

export class ProductoLista implements OnInit {
  productos: Producto[] = [];
  error: string | null = null;

  filtro: string = '';
  productosFiltrados: Producto[] = [];

  pageSize: number = 10;
  currentPage: number = 1;
  Math = Math;

  constructor(private productoApi: ProductoApi) {}

  ngOnInit(): void {
    this.obtenerProductos();
  }

  obtenerProductos(): void {
    this.productoApi.obtenerProductos().subscribe({
      next: (data) => {
        console.log('Productos recibidos:', data); 
        this.productos = data;
        this.productosFiltrados = [...data];
        this.error = null;
      },
      error: (err) => {
        this.error = 'Error al cargar los productos';
        console.error(err);
      }
    });
  }

  filtrarProductos(): void {
    this.currentPage = 1;
  const f = (this.filtro || '').toLowerCase().trim();
  if (!f) {
    this.productosFiltrados = [...this.productos];
    return;
  }
  this.productosFiltrados = this.productos.filter(p =>
    (p.codigo || '').toLowerCase().includes(f) ||
    (p.nombre || '').toLowerCase().includes(f) ||
    (p.categoria || '').toLowerCase().includes(f)
  );
}

//Paginación
get productosPaginados(){
  const startIndex = (this.currentPage -1) * this.pageSize;
  return this.productosFiltrados.slice(startIndex, startIndex + this.pageSize);
}

nextPage()
{
  if(this.currentPage * this.pageSize < this.productosFiltrados.length){
    this.currentPage++;
  }
}

prevPage()
{
  if(this.currentPage > 1){
    this.currentPage--;
  }
}

}
