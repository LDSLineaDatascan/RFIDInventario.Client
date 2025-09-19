import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule, Params } from '@angular/router';
import { filter } from 'rxjs/operators';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.html',
  styleUrls: ['./breadcrumb.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const path = event.urlAfterRedirects || event.url;
        console.log('🔁 Breadcrumb navigation to:', path);
        const built = this.buildManualBreadcrumb(path);
        console.log('🔹 Breadcrumbs built:', JSON.stringify(built));
        this.breadcrumbs = built;
      });
  }

  private buildBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: Breadcrumb[] = []
  ): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;

    for (let child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
        const label = child.snapshot.data?.['breadcrumb'] ?? this.formatLabelFromUrlSegment(routeURL);
        breadcrumbs.push({ label, url });
      }
      this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  private formatLabel(routeURL: string, params: Params): string {
    if (routeURL.includes('inventario-categoria')) return 'Detalle de Categoría';
    if (routeURL.includes('producto-detalle')) return 'Producto Detalle';
    if (routeURL.includes('inventario/categorias')) return 'Categorías';
    if (routeURL.includes('productos')) return 'Productos';
    return this.capitalizeWords(routeURL.replace(/-/g, ' '));
  }

  private capitalizeWords(text: string): string {
    return text.replace(/\b\w/g, l => l.toUpperCase());
  }

  private formatLabelFromUrlSegment(segment: string): string {
    return decodeURIComponent(segment.replace(/-/g, ' '));
  }

  // --- AQUI: reemplazo completo de buildManualBreadcrumb con comportamiento determinista ---
  buildManualBreadcrumb(path: string): Breadcrumb[] {
    const segments = path.split('/').filter(Boolean); // Elimina vacíos
    const crumbs: Breadcrumb[] = [];

    // 1) /inventario/categorias  OR  /inventario/categorias/:idTienda
    if (segments[0] === 'inventario' && segments[1] === 'categorias') {
      // si existe tercer segmento, lo usamos como idTienda
      if (segments.length >= 3 && segments[2]) {
        crumbs.push({ label: 'Categorías', url: `/inventario/categorias/${segments[2]}` });
      } else {
        crumbs.push({ label: 'Categorías', url: '/inventario/categorias' });
      }
      return crumbs;
    }

    // 2) /inventario-categoria-detalle/:idTienda/:categoria
    if (segments[0] === 'inventario-categoria-detalle') {
      const idTienda = segments[1] || '';
      const categoria = segments[2] || '';
      if (idTienda) {
        crumbs.push({ label: 'Categorías', url: `/inventario/categorias/${idTienda}` });
      } else {
        crumbs.push({ label: 'Categorías', url: '/inventario/categorias' });
      }
      crumbs.push({
        label: 'Detalle de Categoría',
        url: `/inventario-categoria-detalle/${idTienda}/${categoria}`,
      });
      return crumbs;
    }

    // 3) /producto-detalle/:idTienda/:idProducto
    if (segments[0] === 'producto-detalle') {
      const idTienda = segments[1] || '';
      const idProducto = segments[2] || '';
      const categoria = sessionStorage.getItem('categoriaSeleccionada') || '';

      if (idTienda) {
        crumbs.push({ label: 'Categorías', url: `/inventario/categorias/${idTienda}` });
      } else {
        crumbs.push({ label: 'Categorías', url: '/inventario/categorias' });
      }

      if (categoria) {
        crumbs.push({
          label: 'Detalle de Categoría',
          url: `/inventario-categoria-detalle/${idTienda}/${categoria}`,
        });
      } else {
        // si no hay categoria en session, aún agregamos el detalle con segmento vacío (opcional)
        crumbs.push({
          label: 'Detalle de Categoría',
          url: `/inventario-categoria-detalle/${idTienda}/`,
        });
      }

      crumbs.push({
        label: 'Producto Detalle',
        url: `/producto-detalle/${idTienda}/${idProducto}`,
      });

      return crumbs;
    }

    // 4) Fallback: construir crumbs simples a partir de la URL en caso no coincida con los patrones anteriores
    let accumulated = '';
    for (let i = 0; i < segments.length; i++) {
      accumulated += `/${segments[i]}`;
      crumbs.push({ label: this.formatLabelFromUrlSegment(segments[i]), url: accumulated });
    }
    return crumbs;
  }
}
