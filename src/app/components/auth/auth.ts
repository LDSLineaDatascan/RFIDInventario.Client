import { Component } from "@angular/core";
import { AuthGoogleApi } from "../../services/auth-api";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'app-auth-google',
    templateUrl: './auth.html',
    styleUrls: ['./auth.css'], 
    imports: [CommonModule],
    standalone: true
})

export class AuthGoogle {
    constructor(private auth: AuthGoogleApi) {}

    login(): void {
        this.auth.login();
    }

    logout(): void {
        this.auth.logout();
    }

    get user()  {
        console.log("Perfil de usuario:", this.auth.profile);
        return this.auth.profile;
    }
}
