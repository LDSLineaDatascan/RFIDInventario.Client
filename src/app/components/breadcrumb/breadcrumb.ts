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

/*  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs = this.buildBreadcrumbs(this.route.root);
      });
  }*/

  ngOnInit(): void {
  this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      const path = event.urlAfterRedirects || event.url;
      this.breadcrumbs = this.buildManualBreadcrumb(path);
    });
}

  private buildBreadcrumbs(
  route: ActivatedRoute,
  url: string = '',
  breadcrumbs: Breadcrumb[] = []
): Breadcrumb[] {
  const children: ActivatedRoute[] = route.children;

  /*if (children.length === 0) {
    return breadcrumbs;
  }*/

  for (let child of children) {
    const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
    if (routeURL !== '') {
      url += `/${routeURL}`;
      //const label = child.snapshot.data['breadcrumb'] || routeURL;
      const label = child.snapshot.data?.['breadcrumb'] ?? this.formatLabelFromUrlSegment(routeURL);

      breadcrumbs.push({ label, url });
    }

    //  CORREGIDO: continuar con todos los hijos recursivamente
    //return this.buildBreadcrumbs(child, url, breadcrumbs);
    this.buildBreadcrumbs(child, url, breadcrumbs);
  }

  return breadcrumbs;
}



private formatLabel(routeURL: string, params: Params): string {
    // Personalizar etiquetas si no se usa data.breadcrumb
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
  // Opcional: puedes usar lógica más avanzada si quieres.
  return decodeURIComponent(segment.replace(/-/g, ' '));
}


buildManualBreadcrumb(path: string): Breadcrumb[] {
  const segments = path.split('/').filter(Boolean); // Elimina vacíos
  const crumbs: Breadcrumb[] = [];

  if (segments[0] === 'inventario' && segments[1] === 'categorias') {
    crumbs.push({ label: 'Categorías', url: '/inventario/categorias' });
  }

  if (segments[0] === 'inventario-categoria-detalle') {
    crumbs.push({ label: 'Categorías', url: '/inventario/categorias' });
    crumbs.push({
      label: 'Detalle de Categoría',
      url: `/inventario-categoria-detalle/${segments[1]}/${segments[2]}`,
    });
  }

  /*if (segments[0] === 'producto-detalle') {
    crumbs.push({ label: 'Categorías', url: '/inventario/categorias' });
    crumbs.push({
      label: 'Detalle de Categoría',
      url: `/inventario-categoria-detalle/${segments[1]}/`,//
    });
    crumbs.push({
      label: 'Producto Detalle',
      url: `/producto-detalle/${segments[1]}/${segments[2]}`,
    });
  }*/

  if (segments[0] === 'producto-detalle') {
  const idTienda = segments[1];
  const idProducto = segments[2];
  const categoria = sessionStorage.getItem('categoriaSeleccionada') || '';

  crumbs.push({ label: 'Categorías', url: '/inventario/categorias' });
  crumbs.push({
    label: 'Detalle de Categoría',
    url: `/inventario-categoria-detalle/${idTienda}/${categoria}`,
  });
  crumbs.push({
    label: 'Producto Detalle',
    url: `/producto-detalle/${idTienda}/${idProducto}`,
  });
}


  return crumbs;
}

    
   

}
