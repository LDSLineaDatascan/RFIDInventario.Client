import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthApi } from '../../services/auth-api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu',
  standalone: true,
  templateUrl: './menu.html',
  styleUrls: ['./menu.css'],
  imports: [RouterModule, CommonModule]
})
export class MenuComponent {

  constructor(private auth: AuthApi) {}

  get loggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get rol(): string | null {
    const usuario = localStorage.getItem("usuarioSesion");
    if (!usuario) return null;

    return JSON.parse(usuario).rol;
  }

  get isAdmin(): boolean {
    return this.rol === 'Admin';
  }

  get isUser(): boolean {
    return this.rol === 'User';
  }
}