import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tienda, TiendaApi } from '../../services/tienda-api';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tienda-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tienda-lista.html',
  styleUrl: './tienda-lista.css'
})
export class TiendaLista implements OnInit {
  tiendas: Tienda[] = [];
  error: string | null = null;
  tiendasFiltradas: Tienda[]=[];
  filtro: string ="";

  constructor(private tiendaApi: TiendaApi) {}

  ngOnInit(): void {
    this.obtenerTiendas();
  }

  obtenerTiendas(): void {
    this.tiendaApi.obtenerTiendas().subscribe({
      next: (data) => {
        this.tiendas = data;
        this.tiendasFiltradas=[...this.tiendas];
        this.error = null;
      },
      error: (err) => {
        this.error = 'Error al cargar las tiendas';
        console.error(err);
      }
    });
  }

  filtrarTiendas(): void{
    const texto= this.filtro.toLowerCase();
    this.tiendasFiltradas= this.tiendas.filter(
      (t) => t.nombre.toLowerCase().includes(texto) || t.codigo.toLowerCase().includes(texto)
    )
  }
}
