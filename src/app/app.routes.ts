import { ResolveStart, Routes } from '@angular/router';
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
import { Auth } from './components/auth/auth';

//dashboard
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { UserDashboard } from './components/user-dashboard/user-dashboard';
import { noAuthGuard } from './guards/no-auth-guard';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  //{ path: '', component: Auth },//inicio 
  //login protegido con guards  
  { path: '', component: Auth, canActivate:[noAuthGuard]},
  { path: 'dashboard-admin', component: AdminDashboard, canActivate: [authGuard]},
  { path: 'dashboard-user', component: UserDashboard, canActivate:[authGuard]},
  { path: 'productos', component: ProductoLista, canActivate:[authGuard], data:{roles: ['Admin']} },         
  { path: 'tiendas', component: TiendaLista, canActivate:[authGuard],data:{roles:['Admin']} },  
  { path: 'tags', component: TagLista, canActivate:[authGuard], data:{roles:['Admin']} },
  { path: 'inventario-teorico', component: InventarioTeoricoLista, canActivate:[authGuard], data:{roles:['Admin', 'User']}} ,
  { path: 'inventario-fisico', component: InventarioFisicoLista, canActivate:[authGuard], data:{roles:['Admin', 'User']}},
  { path: 'comparacion',loadComponent: () => import('./components/comparacion-lista/comparacion-lista').then(m => m.ComparacionLista),
    canActivate:[authGuard], data:{roles:['Admin', 'User']}},
  //{ path: 'dashboard-admin', component: AdminDashboard },
  //{ path: 'dashboard-user', component: UserDashboard },


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
    canActivate:[authGuard],
  data: { breadcrumb: 'Categorías', roles:['Admin', 'User']}
},

  //RUTA PARA SOSTENER IDTEINDA
  {
  path: 'inventario/categorias/:idTienda',
  loadComponent: () => import('./components/inventario-categoria-lista/inventario-categoria-lista')
    .then(m => {
      console.log("Ruta cargada: inventario/categorias CON idTienda");
      return m.InventarioCategoriasComponent;
    }),
    canActivate:[authGuard],
  data: { breadcrumb: 'Categorías', roles:['Admin', 'User'] }
},

  { path: 'inventario-categoria/:idTienda/:categoria', component: InventarioCategoriaDetalleComponent},
  
  //ruta para categoria detalle
  { path: 'inventario-categoria-detalle/:idTienda/:categoria', component: InventarioCategoriaDetalleComponent ,
    canActivate:[authGuard],
    data: { breadcrumb: 'Detalle de Categoría', roles:['Admin', 'User'] }
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