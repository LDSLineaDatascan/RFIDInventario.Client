import { Injectable } from "@angular/core";
import { OAuthService, AuthConfig } from "angular-oauth2-oidc";
import { Router } from "@angular/router";
import { environment } from '../../environments/environment';
import { AppConfigService } from "./app-config-service";


@Injectable({
  providedIn: "root"
})
export class AuthApi {
  constructor(
    private oauthService: OAuthService,
    private router: Router,
    //config
    private appConfigService: AppConfigService
  ) {
    // procesar callback si viene de un proveedor    
    this.handleAuthCallback();
  }

  //valido si  ya hay sesión
  isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  // ************ CONFIGS ************ //
  private getGoogleConfig(): AuthConfig {
    return {
      issuer: "https://accounts.google.com",
      redirectUri: window.location.origin,
      clientId:
        "420118559823-ab95pi8c69ds3c51g4rk9kvpdshghct5.apps.googleusercontent.com",
      scope: "openid profile email",
      strictDiscoveryDocumentValidation: false
    };
  }

  private getMicrosoftConfig(): AuthConfig {
    //as any no tipadas
    return {
      issuer:
        "https://login.microsoftonline.com/03db959e-f515-4356-9100-cc4a9dcf258b/v2.0",
      redirectUri: window.location.origin,
      responseType: "code",
      clientId: "53b9923e-d3c3-43e7-9036-bc2e74f09bc9",
      scope: "openid profile email offline_access User.Read",
      strictDiscoveryDocumentValidation: false,
      skipIssuerCheck: true,
      usePkce: true,
      requireHttps: false,
      showDebugInformation: true
    } as any;
  }

  // ************callback inicial************ //
  private async handleAuthCallback(): Promise<void> {
    const href = window.location.href;

    try {
      //code=fode flow microsoft
      if (href.includes("code=")) {
        try {
          // configuracion microsoft y code flow
          this.oauthService.configure(this.getMicrosoftConfig());
          await this.oauthService.loadDiscoveryDocument();
          // intercambiar code por token
          await this.oauthService.tryLoginCodeFlow();
          if (this.oauthService.hasValidAccessToken()) {
            this.onLoginSuccess("microsoft");
            return;
          }
        } catch (err) {
          console.warn("Error procesando callback de Microsoft:", err);
        }
      }

      // tokens en hash id_token/ access_token = implicit/implicit+PKCE
      if (href.includes("id_token=") || href.includes("access_token=")) {
        try {
          this.oauthService.configure(this.getGoogleConfig());
          await this.oauthService.loadDiscoveryDocumentAndTryLogin();
          if (this.oauthService.hasValidAccessToken()) {
            this.onLoginSuccess("google");
            return;
          }
        } catch (err) {
          console.warn("Error procesando callback de Google:", err);
        }
      }

      // no hay callback lo dejo silent refresh
      this.oauthService.setupAutomaticSilentRefresh();
    } catch (err) {
      console.error("handleAuthCallback fallo:", err);
    }
  }

  // ************login exitos************ //
  private onLoginSuccess(provider: "google" | "microsoft"): void {
    const claims: any = this.oauthService.getIdentityClaims() as any || {};
    const name =
      claims.name ||
      claims.given_name ||
      claims.preferred_username ||
      claims.preferredName ||
      "";
    const email =
      claims.email ||
      claims.preferred_username ||
      claims.upn ||
      claims.userPrincipalName ||
      "";

    console.log(`Login exitoso vía ${provider}`);
    console.log("Nombre:", name);
    console.log("Email:", email);
    //redicreciion
    //this.router.navigate(["/productos"]);

    //confguro la API_URL desde app-config
    const apiUrl = this.appConfigService.get<string>('API_URL', environment.API_URL);
    const baseUrl = apiUrl || environment.API_URL;

    console.log("API_URL configurada en environment Config-app:", baseUrl);

    //Llamo al backend para validar o registrar el suario
    fetch(`${baseUrl}/api/Usuarios/Login-federado`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ correo: email, nombre: name})
    })
      .then(response => response.json())
      .then(usuario =>{
        console.log("Usuario registrado/validado en backend:", usuario);
        console.log("environment auth:", environment.API_URL);
        console.log("baseUrl auth config:", baseUrl);

        if(usuario.rol === "NoAutorizado"){
          alert("Usuario no autorizado. Contacte con el administrador.");
          this.logout();
        }
        else{
          //guardo usuario para cardview wn admindashboard
          localStorage.setItem("usuarioSesion", JSON.stringify(usuario));

          //redirecciono segun rol
          if(usuario.rol ==="Admin")
          {
            this.router.navigate(["/dashboard-admin"]);
          }else if(usuario.rol === "User"){
            this.router.navigate(["/dashboard-user"]);
          }
          else{
            //fallback
            this.router.navigate(["/inicio"]);
          }
        }
      })
      .catch(err => console.error("Error comunicándose con el backend:", err));
  }

  // ************LOGIN-LOGOUT************ //
  loginGoogle(): void {

    if (this.isLoggedIn()) {
      console.log("Ya hay una sesión activa.");
      this.router.navigate(["/productos"]);
      return;
    }

    //iniciamos flow
    this.oauthService.configure(this.getGoogleConfig());
    console.log("Iniciando sesión con Google...");
    this.oauthService
      .loadDiscoveryDocumentAndTryLogin()
      .then(() => {
        if (this.oauthService.hasValidAccessToken()) {
          // token en la URL
          this.onLoginSuccess("google");
        } else {
          // No viene token, redirigimos al flujo de Google
          this.oauthService.initLoginFlow();
        }
      })
      .catch(err => console.error("Error en loginGoogle:", err));
  }

  async loginMicrosoft(): Promise<void> {

    if (this.isLoggedIn()) {
      console.log("Ya hay una sesión activa.");
      this.router.navigate(["/productos"]);
      return;
    }
    //code flow
    this.oauthService.configure(this.getMicrosoftConfig());
    console.log("Iniciando sesión con Microsoft...");
    try {
      await this.oauthService.loadDiscoveryDocument();
      //Code Flow + PKCE
      this.oauthService.initCodeFlow();
      //redirect y luego handleAuthCallback
    } catch (err) {
      console.error("Error en loginMicrosoft:", err);
    }
  }

  logout(): void {
    console.log("Cerrando sesión...");
    this.oauthService.logOut();
  }

  
  get profile() {
    return this.oauthService.getIdentityClaims();
  }

  get token() {
    return this.oauthService.getAccessToken();
  }
}
