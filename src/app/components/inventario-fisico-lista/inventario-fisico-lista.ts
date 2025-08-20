import { Component, OnInit } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TiendaApi, Tienda } from '../../services/tienda-api';
import { InventarioFisicoApi, InventarioFisico } from '../../services/inventario-fisico-api';



@Component({
    selector: 'app-inventario-fisico-lista',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './inventario-fisico-lista.html',
    styleUrl: './inventario-fisico-lista.css'
})

export class InventarioFisicoLista implements OnInit {
    inventario: InventarioFisico[] = [];
    tiendas: Tienda[] = [];
    idTienda = '';
    error: string | null = null;

    constructor(private inventarioFisicoApi: InventarioFisicoApi, private tiendaApi: TiendaApi) {}

    ngOnInit(): void {
        this.cargarTiendas();
    }

    cargarTiendas(): void {
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
        this.inventarioFisicoApi.obtenerInventarioPorTienda(this.idTienda).subscribe({
            next: (data) => {
                this.inventario = data;
                this.error = null;
            },
            error: (err) => {
                this.error = 'Error al cargar el inventario';
                console.error(err);
            }
        });
    }


    descargarCSV(): void {
        if (!this.inventario.length) return;

        const encabezado = 'Tienda,Producto,Categoría,Stock Físico';
        const filas = this.inventario.map(item =>
            `"${item.tienda}","${item.producto}","${item.categoria}",${item.cantidadLectura}`
        );
        const contenido = [encabezado, ...filas].join('\n');
        const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `inventario_fisico_${this.idTienda}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
