import { Injectable } from "@angular/core";
import { OAuthService, AuthConfig } from "angular-oauth2-oidc";
import { Router } from "@angular/router";


@Injectable({
    providedIn: 'root'
})

export class AuthApi {

    constructor(private oauthService: OAuthService,
        private router: Router//para redireccionamiento
    ) {
        //this.initAuth();
    }

    //************LOGIN GOOGLE*************//
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
                //this.router.navigate(['localhost:4200']);
            }
        });
        this.oauthService.setupAutomaticSilentRefresh();
    }

    //************LOGIN MICROSOFT*************//
    private async initAuthMicrosoft(): Promise<void> {
        const authConfig: AuthConfig = {
            loginUrl: 'https://login.microsoftonline.com/03db959e-f515-4356-9100-cc4a9dcf258b/oauth2/v2.0/authorize',
            issuer: 'https://login.microsoftonline.com/03db959e-f515-4356-9100-cc4a9dcf258b/v2.0',
            redirectUri: window.location.origin,
            responseType: 'code',           
            clientId: '53b9923e-d3c3-43e7-9036-bc2e74f09bc9',
            scope: 'openid profile email offline_access User.Read',
            strictDiscoveryDocumentValidation: false,
            usePkce: true,
            showDebugInformation: true,
        }as any;

        console.log("Configuración OAuth Microsoft:", authConfig);

        this.oauthService.configure(authConfig);

        this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
            if (this.oauthService.hasValidAccessToken()) {
                console.log("Usuario autenticado", this.profile);
                console.log("Token válido: ", this.token);
                //redireccionamiento
                this.router.navigate(['/productos']);
            }
            else{
                console.log("No hay token válido de microsoft");
            }
        });
        this.oauthService.setupAutomaticSilentRefresh();
    }

    loginMicrosoft(): void {
        this.initAuthMicrosoft();
        console.log("Iniciando sesión con Microsoft...");
        //this.oauthService.initLoginFlow();
        this.oauthService.initCodeFlow();
    }

    login(): void {
        this.initAuth();
        console.log("Iniciando sesión con Google...");
        this.oauthService.initLoginFlow();
    }

    logout(): void {
        console.log("Cerrando sesión...");
        this.oauthService.logOut();
    }

    get profile(){
        return this.oauthService.getIdentityClaims();
    }

    get token(){
        return this.oauthService.getAccessToken();
    }
}