import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApi } from '../services/auth-api';

export const noAuthGuard: CanActivateFn = (route, state) => {
  
  //inyecto servicios
  const auth = inject(AuthApi);
  const router = inject(Router);

  if(auth.isLoggedIn()){
    //obtengo usuario guardado con rol
    const usuarioSesion=localStorage.getItem('usuarioSesion');
    if(usuarioSesion){
      const usuario=JSON.parse(usuarioSesion);
      //redirijo a dashboard si el usuario ya tiene sesión iniciada
      if(usuario.rol==='Admin'){
        router.navigate(['/dashboard-admin']);
        console.log('Usuario con sesión iniciada, redirigiendo a dashboard-admin');
      }
      else if(usuario.rol==='User'){
        router.navigate(['/dashboard-user']);
        console.log('Usuario con sesión iniciada, redirigiendo a dashboard-user');
      }
      else{
        //si el rol no es reconocido, redirijo a login
        router.navigate(['/']);
        console.log('Rol de usuario no reconocido, redirigiendo a login');
      }
    }else{
      //si no hay usuario en sesión, redirijo a login
      router.navigate(['/']);
      console.log('No se encontró usuario en sesión, redirigiendo a login');
    }
    return false;
  }

  return true;
};
