import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ComparacionApi, ComparacionInventario } from './comparacion-api';
import { HttpClient } from '@angular/common/http';


export interface ResumenCategoria {
  categoria: string;
  teorico: number;
  fisico: number;
  faltantes: number;
  sobrantes: number; 
  adicionales: number;
  progreso: number;
  productos: ComparacionInventario[];
}

@Injectable({ providedIn: 'root' })
export class InventarioCategoriaApi {
  constructor(private comparacionApi: ComparacionApi, private http: HttpClient) {}
  

  obtenerResumenPorCategoria(idTienda: string): Observable<ResumenCategoria[]> {
    return new Observable(subscriber => {
      this.comparacionApi.obtenerComparacionPorTienda(idTienda).subscribe(productos => {
        const resumenMap = new Map<string, ResumenCategoria>();

        for (const producto of productos) {
          const cat = producto.categoria;
          if (!resumenMap.has(cat)) {
            resumenMap.set(cat, {
              categoria: cat,
              teorico: 0,
              fisico: 0,
              faltantes: 0,
              sobrantes: 0,
              adicionales: 0,
              progreso: 0,
              productos: [],
            });
          }

          const resumen = resumenMap.get(cat)!;

          // Stock teórico acumulado
          resumen.teorico += producto.stockTeorico;

          // Stock físico limitado al stock teórico de cada producto
          resumen.fisico += Math.min(producto.stockFisico, producto.stockTeorico);

          // Faltantes
          if (producto.stockTeorico > producto.stockFisico) {
            resumen.faltantes += producto.stockTeorico - producto.stockFisico;
          }

          // Sobrantes
          /*if(producto.stockFisico > producto.stockTeorico) {
            resumen.sobrantes += producto.stockFisico - producto.stockTeorico;
          }*/
          if(producto.stockTeorico > 0 && producto.stockFisico > producto.stockTeorico) {
            resumen.sobrantes += producto.stockFisico - producto.stockTeorico;}

          //Adiconales
          if(producto.stockTeorico ===0 && producto.stockFisico >0){
            resumen.adicionales += producto.stockFisico;}

          resumen.productos.push(producto);
        }

        
        for (const resumen of resumenMap.values()) {
          resumen.progreso = resumen.teorico === 0
            ? 0
            : Math.round((resumen.fisico / resumen.teorico) * 100);
        }

        subscriber.next(Array.from(resumenMap.values()));
        subscriber.complete();
      });
    });
  }

  private apiUrl = 'http://localhost:5097/Inventario';

  cargarInventarioTeorico() {
  //return this.http.post('/inventario/cargarTeorico', {});
  //return this.http.post('https://localhost:7293/inventario/cargarTeorico', {});
  return this.http.post(`${this.apiUrl}/cargarTeorico`, {});

}


//funciona bien
/*reiniciarInventario(): Observable<any> {
  return this.http.post(`${this.apiUrl}/reiniciar`, {});
}*/

/*reiniciarInventario(idTienda: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/Inventario/reiniciar?idTienda=${idTienda}`, {});
}*/

/*reiniciarInventario(idTienda: string): Observable<any> {
  return this.http.post(`/Inventario/reiniciar`, { idTienda });
}*/
reiniciarInventario(idTienda: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/reiniciar`, { idTienda });
}





}
