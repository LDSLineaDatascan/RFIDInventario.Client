import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { InventarioCategoriaApi, ResumenCategoria } from '../../services/inventario-categoria-api';
import { TiendaApi, Tienda } from '../../services/tienda-api';
import { ComparacionInventario } from '../../services/comparacion-api';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import { SignalRService } from '../../services/signalr-api';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-inventario-categorias',
  standalone: true,
  templateUrl: './inventario-categoria.html',
  styleUrl: './inventario-categoria.css',
  imports: [FormsModule, CommonModule], 
})
export class InventarioCategoriasComponent implements OnInit {
  tiendas: Tienda[] = [];
  idTienda = '';
  resumenCategorias: ResumenCategoria[] = [];

  filtroCategoria = '';
  categoriaSeleccionada = '';
  detalleCategoria: ComparacionInventario[] = [];

  progresoGeneral = 0;

  estadoTienda: string = '';
  cargandoEstado: boolean = false;

  ultimaActualizacion = new Date();

  pageSize: number = 10;
  currentPage: number = 1;
  Math = Math;

  constructor(
    private tiendaApi: TiendaApi,
    private categoriaApi: InventarioCategoriaApi,
    private router: Router,
    private signalRService: SignalRService,
    private route: ActivatedRoute 
  ) {}

  
  /*ngOnInit(): void {
    this.tiendaApi.obtenerTiendas().subscribe(data => {
      this.tiendas = data;
      if (this.tiendas.length > 0) {
        this.idTienda = this.tiendas[0].codigo;
        this.obtenerResumen();
      }
    });
  }*/

    //*********************************************
  /*ngOnInit(): void {
    this.signalRService.iniciarConexion();
    this.tiendaApi.obtenerTiendas().subscribe(data => {
    this.tiendas = data;
    if (this.tiendas.length > 0) {
      this.idTienda = this.tiendas[0].codigo;
      console.log('Tienda seleccionada:', this.idTienda);
      this.obtenerResumen();

      // Escucha eventos de reinicio desde SignalR
      this.signalRService.iniciarConexion(); //IMPORTANTE
      this.signalRService.escucharEvento('Reiniciar', (tiendaId: string) => {//REINICIAR INVENTARIO OMPLETO
        if (tiendaId === this.idTienda) {
          console.log('Reiniciando desde SignalR');
          this.obtenerResumen(); // ✅ actualiza resumen automáticamente
        }
      });

      this.signalRService.onActualizarDatos =()=>{
        console.log("Actualizando datos");
        this.obtenerResumen();
      };

      /*this.signalRService.escucharEvento('Reiniciar', (idTienda: string) => {
        if (idTienda === this.idTienda) {
      console.log('🔄 Recargando inventario por categorías...');
      this.obtenerResumen();
    }
  });----

    }
  });

  
}*/

/*ngOnInit(): void {
  // 1. loe idTienda desde la url queryParams o paramMap
  this.route.queryParams.subscribe(params => {
    const tiendaParam = params['idTienda'];
    if (tiendaParam) {
      this.idTienda = tiendaParam;
      console.log('🔹 idTienda desde queryParams:', this.idTienda);
    }
  });

  this.route.paramMap.subscribe(params => { 
    const tiendaParam = params.get('idTienda');
    if (tiendaParam) {
      this.idTienda = tiendaParam;
      console.log('idTienda desde paramMap:', this.idTienda);
    }
  });

  // 2. obtengo tiendas y idTienda si no viene por URL
  this.tiendaApi.obtenerTiendas().subscribe(data => {
    this.tiendas = data;

    if (this.tiendas.length > 0) {
      // Si no reecibo pr  URL, uso la primera tienda por defecto
      if (!this.idTienda) {
        this.idTienda = this.tiendas[0].codigo;
      }

      console.log('tienda seleccionada final:', this.idTienda);
      this.obtenerResumen();

      // 3. empiezo conexión SignalR solo una vez
      this.signalRService.iniciarConexion();

      //  evento InventarioActualizado
      this.signalRService.escucharEvento('InventarioActualizado', () => {
        console.log('Evento recibido: InventarioActualizado');
        this.obtenerResumen(); 
      });

      // 4.  evento 'reinicio por tienda
      this.signalRService.escucharEvento('Reiniciar', (tiendaId: string) => {
        if (tiendaId === this.idTienda) {
          console.log('🔄 Reiniciando desde SignalR');
          this.obtenerResumen();
        }
      });

      // 5. También actualiza datos si se recibe el trigger directo
      this.signalRService.onActualizarDatos = () => {
        console.log('🔄 Actualizando datos desde SignalR');
        this.obtenerResumen();
      };
    }
  });
}*///oct 14
ngOnInit(): void {
  // 1. leo idTienda desde la url queryParams o paramMap
  this.route.queryParams.subscribe(params => {
    const tiendaParam = params['idTienda'];
    if (tiendaParam) {
      this.idTienda = tiendaParam;
      console.log('🔹 idTienda desde queryParams:', this.idTienda);
    }
  });

  this.route.paramMap.subscribe(params => { 
    const tiendaParam = params.get('idTienda');
    if (tiendaParam) {
      this.idTienda = tiendaParam;
      console.log('idTienda desde paramMap:', this.idTienda);
    }
  });

  // 2. obtengo tiendas y idTienda si no viene por URL
  this.tiendaApi.obtenerTiendas().subscribe(data => {
    this.tiendas = data;

    //filtrado rol del usuario
    const rawSesion = localStorage.getItem('usuarioSesion');
    const usuarioSesion = rawSesion ? JSON.parse(rawSesion) : null;
    const rol = usuarioSesion?.rol;

    if (rol === 'User') {
      const asignadas = (usuarioSesion?.tiendasAsignadas || []).map((t: any) => t.codigo ?? t.tiendaCodigo);
      if (!asignadas || asignadas.length === 0) {
        console.warn('Usuario sin tiendas asignadas');
        this.tiendas = [];
        this.idTienda = '';
        return; // no carga resumen
      }
      // filtro tiendas visibles
      this.tiendas = this.tiendas.filter(t => asignadas.includes(t.codigo));

      // si el idTienda actual no pertenece a sus asignadas
      if (this.idTienda && !asignadas.includes(this.idTienda)) {
        console.warn('idTienda no autorizada, usando primera asignada');
        this.idTienda = this.tiendas.length ? this.tiendas[0].codigo : '';
      }

      // si no hay idTienda, uso la primera asignada
      if (!this.idTienda && this.tiendas.length > 0) {
        this.idTienda = this.tiendas[0].codigo;
      }
    } else {
      // Admin u otros roles
      if (this.tiendas.length > 0 && !this.idTienda) {
        this.idTienda = this.tiendas[0].codigo;
      }
    }
      // fin filtrado

    if (this.tiendas.length > 0) {
      // Si no recibo por url, uso la primera tienda por defecto
      const tiendaGuardada = localStorage.getItem("tiendaSeleccionada");

      if (!this.idTienda) {
        this.idTienda = this.tiendas[0].codigo;
      }

      console.log('tienda seleccionada final:', this.idTienda);
      this.obtenerResumen();
      // cargar estado de la tienda
      this.obtenerEstadoTienda();


      // 3. empiezo conexión SignalR solo una vez
      this.signalRService.iniciarConexion();

      //  evento InventarioActualizado
      this.signalRService.escucharEvento('InventarioActualizado', () => {
        console.log('Evento recibido: InventarioActualizado');
        this.obtenerResumen(); 
      });

      // 4.  evento 'reinicio por tienda
      this.signalRService.escucharEvento('Reiniciar', (tiendaId: string) => {
        if (tiendaId === this.idTienda) {
          console.log('🔄 Reiniciando desde SignalR');
          this.obtenerResumen();
        }
      });

      // 5. También actualiza datos si se recibe el trigger directo
      this.signalRService.onActualizarDatos = () => {
        console.log('🔄 Actualizando datos desde SignalR');
        this.obtenerResumen();
      };
    }
  });
}



  obtenerResumen(): void {
    this.categoriaApi.obtenerResumenPorCategoria(this.idTienda).subscribe(resumen => {
      this.resumenCategorias = resumen;
      this.detalleCategoria = [];
      this.calcularProgresoGeneral();
      this.ultimaActualizacion = new Date(); // Actualiza la fecha de la última actualización
      console.log('Fecha Actualización:', this.ultimaActualizacion);
    });
  }

  resumenFiltrado(): ResumenCategoria[] {
    return this.resumenCategorias.filter(r =>
      r.categoria.toLowerCase().includes(this.filtroCategoria.toLowerCase())
    );
  }

  verDetalle(categoria: string): void {
    //botn funcional ok
    this.router.navigate(['/inventario-categoria-detalle', this.idTienda, categoria]);
  }

  descargarCSV(): void {
  if (!this.resumenCategorias || this.resumenCategorias.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  //fecha y hora para el nombre del archivo
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');

  const fechaHoraArchivo =
    `${now.getFullYear()}-` +
    `${pad(now.getMonth() + 1)}-` +
    `${pad(now.getDate())}T` +
    `${pad(now.getHours())}-` +
    `${pad(now.getMinutes())}-` +
    `${pad(now.getSeconds())}`;

  // encabezados
  const encabezados = ['Categoría', 'Stock Teórico', 'Stock Físico', 'Faltantes','Sobrantes', 'Adicionales','Progreso %'];

  // datos a filas
  const filas = this.resumenCategorias.map(cat => [
    cat.categoria,
    cat.teorico,
    cat.fisico,
    cat.faltantes,
    cat.sobrantes,
    cat.adicionales,
    cat.progreso
  ]);

  // Unir encabezados y filas
  const csvContent = [encabezados, ...filas]
    .map(e => e.join(','))
    .join('\n');

  // Crear Blob y descargar
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `resumen_categorias_${this.idTienda}_${fechaHoraArchivo}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

cargarInventarioTeorico(): void {
  if (!confirm('¿Desea cargar el inventario teórico desde el archivo plano?')) return;

  this.categoriaApi.cargarInventarioTeorico().subscribe({
    next: () => {
      alert('Inventario teórico cargado correctamente.');
      this.obtenerResumen(); // refrescoo la tabla
    },
    error: (err) => {
      console.error(err);
      alert('Error al cargar inventario teórico');
    }
  });
}

calcularProgresoGeneral(): void {
  const teoricoFiltrado = this.resumenCategorias.filter(item => item.teorico > 0);
  const totalTeorico = teoricoFiltrado.reduce((sum, item) => sum + item.teorico, 0);

  // Acumular el físico limitado (igual que en categorías)
  const totalFisicoLimitado = teoricoFiltrado.reduce((sum, item) => {
    const fisicoLimitado = item.productos
      .map(p => Math.min(p.stockFisico, p.stockTeorico))
      .reduce((acc, val) => acc + val, 0);
    return sum + fisicoLimitado;
  }, 0);

  if (totalTeorico === 0) {
    this.progresoGeneral = 0;
  } else {
    this.progresoGeneral = Math.min(100, Math.round((totalFisicoLimitado / totalTeorico) * 100));
  }
}



/*reiniciarInventario() {
  if (confirm('¿Está seguro de reiniciar el inventario?')) {
    this.categoriaApi.reiniciarInventario().subscribe({
      next: () => {
        alert('Inventario reiniciado correctamente.');
        this.obtenerResumen(); // refresca datos
      },
      error: (err) => console.error(err)
    });
  }
}*/

reiniciarInventario() {
  if(confirm('¿Está seguro de reiniciar el conteo?')) {
    this.categoriaApi.reiniciarInventario(this.idTienda).subscribe({
      next: () => {console.log('Conteo reiniciado correctamente desde Signal R 846.'),
        alert('Conteo reinciado correctamente.')
      },
      error: (err) => console.error(err)
    });
  }
  
}

irAComparacion(): void {
  if (!this.idTienda) {
    alert('Debe seleccionar una tienda');
    return;
  }

  this.router.navigate(['/comparacion'], { queryParams: { idTienda: this.idTienda } });
}

//Paginación
get categoriasPaginadas(){
  const startIndex = (this.currentPage -1) * this.pageSize;
  return this.resumenFiltrado().slice(startIndex, startIndex + this.pageSize);
}

nextPage(){
  if((this.currentPage * this.pageSize) < this.resumenFiltrado().length){
    this.currentPage++;
  }
}

prevPage(){
  if(this.currentPage > 1){
    this.currentPage--;
  }
}


//totaltes
getTotal(campo: keyof ResumenCategoria): number {
  return this.resumenCategorias.reduce((acc, item) => {
    const valor = Number(item[campo]); // forzo conversión
    return acc + (isNaN(valor) ? 0 : valor);
  }, 0);
}

//obtener estado de la tienda
obtenerEstadoTienda(): void {
  if (!this.idTienda) return;

  this.cargandoEstado = true;

  this.categoriaApi.getEstadoTienda(this.idTienda).subscribe({
    next: (resp) => {
      this.estadoTienda = resp.estado;
      this.cargandoEstado = false;
      console.log('Estado tienda:', this.estadoTienda);
    },
    error: () => {
      this.cargandoEstado = false;
      console.error('Error obteniendo estado de la tienda');
    }
  });
}

//cambiar estado de la tienda
cambiarEstadoTienda(): void {
  if (!this.idTienda) return;

  const nuevo = this.estadoTienda === 'Abierto' ? 'Cerrado' : 'Abierto';

  if (!confirm(`¿Desea cambiar el estado a "${nuevo}"?`)) return;

  this.categoriaApi.cambiarEstadoTienda(this.idTienda, nuevo).subscribe({
    next: () => {
      this.estadoTienda = nuevo;
      alert('Estado cambiado correctamente.');
    },
    error: (err) => {
      console.error(err);
      alert('Error al cambiar el estado.');
    }
  });
}

onTiendaChange(): void {
  console.log("🔄 Cambió la tienda →", this.idTienda);


  //agrego navegación a comparación para mantener idTienda en la url
  localStorage.setItem("tiendaSeleccionada", this.idTienda);
  this.router.navigate(['/inventario/categorias', this.idTienda]);
  
  this.currentPage = 1;        
  this.obtenerResumen();
  this.obtenerEstadoTienda();
}


}
