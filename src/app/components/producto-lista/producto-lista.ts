import { Component, OnInit } from '@angular/core';
import { Producto, ProductoApi } from '../../services/producto-api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-producto-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './producto-lista.html',
  styleUrl: './producto-lista.css'
})

export class ProductoLista implements OnInit {
  productos: Producto[] = [];
  error: string | null = null;

  constructor(private productoApi: ProductoApi) {}

  ngOnInit(): void {
    this.obtenerProductos();
  }

  obtenerProductos(): void {
    this.productoApi.obtenerProductos().subscribe({
      next: (data) => {
        console.log('Productos recibidos:', data); 
        this.productos = data;
        this.error = null;
      },
      error: (err) => {
        this.error = 'Error al cargar los productos';
        console.error(err);
      }
    });
  }
  
}
