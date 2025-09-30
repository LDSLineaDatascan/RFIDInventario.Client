import { Injectable } from "@angular/core";
import { OAuthService, AuthConfig } from "angular-oauth2-oidc";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root"
})
export class AuthApi {
  constructor(
    private oauthService: OAuthService,
    private router: Router
  ) {
    // procesar callback si viene de un proveedor    
    this.handleAuthCallback();
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
          // configurar para microsoft y procesar code flow
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
    this.router.navigate(["/productos"]);
  }

  // ************LOGIN-LOGOUT************ //
  loginGoogle(): void {
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
