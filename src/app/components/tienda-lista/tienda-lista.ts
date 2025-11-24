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

  pageSize: number = 10;
  currentPage: number = 1;
  Math = Math;

  //propiedades estado tienda
  tiendaSeleccionada?: Tienda | null = null;
  nuevoEstadoTienda: string ="";

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
    this.currentPage=1;
    const texto= this.filtro.toLowerCase();
    this.tiendasFiltradas= this.tiendas.filter(
      (t) => t.nombre.toLowerCase().includes(texto) || t.codigo.toLowerCase().includes(texto)
    )
  }

  //Paginacion
  get tiendasPaginadas(){
    const startIndex= (this.currentPage -1) * this.pageSize;
    return this.tiendasFiltradas.slice(startIndex, startIndex + this.pageSize);
  }

  nextPage(){
    if(this.currentPage < this.Math.ceil(this.tiendasFiltradas.length / this.pageSize)){
      this.currentPage++;
    } 
  }

  prevPage(){
    if(this.currentPage > 1){
      this.currentPage--;
    } 
  }

  //estado tienda
 // Reemplaza tu método por este
abrirModalEditarEstado(tienda?: Tienda) {
  // usar el filtrada
  if (tienda) {
    this.tiendaSeleccionada = tienda;
    this.nuevoEstadoTienda = tienda.estado?.toString() ?? 'Abierto';
    return;
  }

  //filtradas
  const texto = (this.filtro || '').toString().trim().toLowerCase();

  if (texto) {
    //un resultado filtrado lo selecciono
    if (this.tiendasFiltradas.length === 1) {
      this.tiendaSeleccionada = this.tiendasFiltradas[0];
    } else {
      // encontrar coincidencia exacta
      const exacta = this.tiendasFiltradas.find(t =>
        t.codigo?.toString().toLowerCase() === texto ||
        t.nombre?.toString().toLowerCase() === texto
      );
      // si no hay exacta
      this.tiendaSeleccionada = exacta ?? this.tiendasFiltradas.find(t =>
        t.codigo?.toString().toLowerCase().includes(texto) ||
        t.nombre?.toString().toLowerCase().includes(texto)
      ) ?? null;
    }
  } else {
    //  escribio nada
    this.tiendaSeleccionada = null;
  }

  //inicializo el estado
  this.nuevoEstadoTienda = this.tiendaSeleccionada?.estado?.toString() ?? 'Abierto';
}

  
  guardarEstadoTienda() {
    if (!this.tiendaSeleccionada) { alert('Seleccione una tienda'); return; }

    this.tiendaApi.cambiarEstadoTienda(this.tiendaSeleccionada.codigo, this.nuevoEstadoTienda)
      .subscribe({
        next: () => {
          // actualizo ui local
          const t = this.tiendas.find(x => x.codigo === this.tiendaSeleccionada!.codigo);
          if (t) t.estado = this.nuevoEstadoTienda;
          //muestra el nuevo estado
          this.tiendasFiltradas = [...this.tiendas];
          alert('Estado actualizado');
        },
        error: (err) => {
          console.error(err);
          alert('Error actualizando estado');
        }
      });
  }

}
