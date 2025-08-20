import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tienda, TiendaApi } from '../../services/tienda-api';

@Component({
  selector: 'app-tienda-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tienda-lista.html',
  styleUrl: './tienda-lista.css'
})
export class TiendaLista implements OnInit {
  tiendas: Tienda[] = [];
  error: string | null = null;

  constructor(private tiendaApi: TiendaApi) {}

  ngOnInit(): void {
    this.obtenerTiendas();
  }

  obtenerTiendas(): void {
    this.tiendaApi.obtenerTiendas().subscribe({
      next: (data) => {
        this.tiendas = data;
        this.error = null;
      },
      error: (err) => {
        this.error = 'Error al cargar las tiendas';
        console.error(err);
      }
    });
  }
}
