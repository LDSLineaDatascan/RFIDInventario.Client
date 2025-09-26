import { Routes } from '@angular/router';
import { RouterModule } from '@angular/router'; 
import { ProductoLista } from './components/producto-lista/producto-lista';

// tienda-lista
import { TiendaLista } from './components/tienda-lista/tienda-lista';

// tag-lista
import { TagLista } from './components/tag-lista/tag-lista';

// inventario-teorico-lista
import { InventarioTeoricoLista } from './components/inventario-teorico-lista/inventario-teorico-lista';

//inventario-fisico-lista
import { InventarioFisicoLista } from './components/inventario-fisico-lista/inventario-fisico-lista';

// comparacion
import { ComparacionLista } from './components/comparacion-lista/comparacion-lista';

import { InventarioCategoriaDetalleComponent } from './components/inventario-categoria-detalle-lista/inventario-categoria-detalle';
import { InventarioProductoDetalleComponent } from './components/inventario-producto-detalle/inventario-producto-detalle';

//ruta google auth
import { AuthGoogle } from './components/auth/auth';


export const routes: Routes = [
  { path: '', component: AuthGoogle },//inicio  
  { path: 'productos', component: ProductoLista },         
  { path: 'tiendas', component: TiendaLista },  
  { path: 'tags', component: TagLista },
  { path: 'inventario-teorico', component: InventarioTeoricoLista } ,
  { path: 'inventario-fisico', component: InventarioFisicoLista },
  { path: 'comparacion',loadComponent: () => import('./components/comparacion-lista/comparacion-lista').then(m => m.ComparacionLista)},
  
  //
  //{ path: 'inventario/categorias',loadComponent: () => import('./components/inventario-categoria-lista/inventario-categoria-lista').then(m => m.InventarioCategoriasComponent)},
  //bread inical para categoria
  /*{
  path: 'inventario/categorias',
  loadComponent: () => import('./components/inventario-categoria-lista/inventario-categoria-lista').then(m => m.InventarioCategoriasComponent),
  data: { breadcrumb: 'Categorías' }
  },*/

  {
  path: 'inventario/categorias',
  loadComponent: () => import('./components/inventario-categoria-lista/inventario-categoria-lista')
    .then(m => {
      console.log("Ruta cargada: inventario/categorias SIN idTienda");
      return m.InventarioCategoriasComponent;
    }),
  data: { breadcrumb: 'Categorías' }
},

  //RUTA PARA SOSTENER IDTEINDA
  {
  path: 'inventario/categorias/:idTienda',
  loadComponent: () => import('./components/inventario-categoria-lista/inventario-categoria-lista')
    .then(m => {
      console.log("Ruta cargada: inventario/categorias CON idTienda");
      return m.InventarioCategoriasComponent;
    }),
  data: { breadcrumb: 'Categorías' }
},

  { path: 'inventario-categoria/:idTienda/:categoria', component: InventarioCategoriaDetalleComponent},
  
  //ruta para categoria detalle
  { path: 'inventario-categoria-detalle/:idTienda/:categoria', component: InventarioCategoriaDetalleComponent ,
    data: { breadcrumb: 'Detalle de Categoría' }
  }, 
  { path: 'productoDetalle/:idTienda/:idProducto', component: InventarioCategoriaDetalleComponent },
  
  //
  //{ path: 'producto-detalle/:idTienda/:idProducto', component: InventarioProductoDetalleComponent },
  //breadcrumb para producto detalle
  {
  path: 'producto-detalle/:idTienda/:idProducto',
  component: InventarioProductoDetalleComponent,
  data: { breadcrumb: 'Producto Detalle' }
  }
];