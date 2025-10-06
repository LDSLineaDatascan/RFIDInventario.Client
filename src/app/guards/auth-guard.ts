import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthApi } from '../services/auth-api';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthApi);
  const router = inject(Router);

  //redirige al login
  if (!auth.isLoggedIn()) {
    console.log('No hay sesión activa. Redirigiendo al login...');
    router.navigate(['/']);
    return false;
  }

  console.log('Usuario autenticado por Guards');

  //usuario de localStorage
  const usuarioSesion = localStorage.getItem('usuarioSesion');
  if (!usuarioSesion) {
    console.log('No se encontró información de sesión');
    router.navigate(['/']);
    return false;
  }

  const usuario = JSON.parse(usuarioSesion);
  const rol = usuario.rol;

  //roles permitidos 
  const rolesPermitidos = route.data?.['roles'] as string[];

  //valido acceso
  if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
    console.log(`Rol ${rol} no autorizado para esta ruta`);

    //redirijo segn el rol
    if (rol === 'Admin') {
      console.log('Redirigiendo al dashboard-admin');
      router.navigate(['/dashboard-admin']);
    } else if (rol === 'User') {
      console.log('Redirigiendo al dashboard-user');
      router.navigate(['/dashboard-user']);
    } else {
      console.log('Rol no reconocido');
      router.navigate(['/']);
    }

    return false;
  }

  console.log('Acceso permitido por GUARD');
  return true;
};
