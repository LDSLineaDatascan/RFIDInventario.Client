import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthApi } from '../services/auth-api';

export const authGuard: CanActivateFn = (route, state) => {
  //Servicios inuyectados
  const auth = inject(AuthApi);
  const router = inject(Router);

  //Valido si hay sesión iniciada
  if (auth.isLoggedIn()) {
    console.log('Usuario autenticado Guards');
    return true;
  } else {
    //redirijo a login porque no hay sesion iniciada
    router.navigate(['/']);
    return false;
  }
};
