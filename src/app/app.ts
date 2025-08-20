import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductoLista } from './components/producto-lista/producto-lista';
import { MenuComponent } from './components/menu/menu';
import { RouterModule } from '@angular/router'; 
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MenuComponent, RouterModule, BreadcrumbComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  protected title = 'RFIDInventario.Client';
}
