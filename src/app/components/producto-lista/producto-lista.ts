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

  
}
