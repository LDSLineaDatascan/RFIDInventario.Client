import { Injectable } from "@angular/core";
import { OAuthService, AuthConfig } from "angular-oauth2-oidc";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})

export class AuthGoogleApi {

    constructor(private oauthService: OAuthService,
        private router: Router
    ) {
        this.initAuth();
    }

    private initAuth(): void {
        const authConfig: AuthConfig = {
            issuer: 'https://accounts.google.com',
            redirectUri: window.location.origin,
            clientId: '420118559823-ab95pi8c69ds3c51g4rk9kvpdshghct5.apps.googleusercontent.com',
            scope: 'openid profile email',
            strictDiscoveryDocumentValidation: false,
        };

        console.log("Configuración OAuth:", authConfig);

        this.oauthService.configure(authConfig);
        //this.oauthService.loadDiscoveryDocumentAndTryLogin();
        this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
            if (this.oauthService.hasValidAccessToken()) {
                console.log("Usuario autenticado", this.profile);
                console.log("Token válido: ", this.token);
                //redireccionamiento
                this.router.navigate(['/productos']);
            }
        });
        this.oauthService.setupAutomaticSilentRefresh();
    }

    login(): void {
        console.log("Iniciando sesión con Google...");
        this.oauthService.initLoginFlow();
    }

    logout(): void {
        console.log("Cerrando sesión con Google...");
        this.oauthService.logOut();
    }

    get profile(){
        return this.oauthService.getIdentityClaims();
    }

    get token(){
        return this.oauthService.getAccessToken();
    }
}