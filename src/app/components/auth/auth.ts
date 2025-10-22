import { Component, OnInit } from "@angular/core";
import { AuthApi } from "../../services/auth-api";
import { CommonModule } from "@angular/common";
import { AppConfigService } from "../../services/app-config-service";

@Component({
  selector: "app-auth",
  templateUrl: "./auth.html",
  styleUrls: ["./auth.css"],
  imports: [CommonModule],
  standalone: true
})
export class Auth implements OnInit{
  constructor(private auth: AuthApi, private appConfig: AppConfigService) {}

  ngOnInit(): void {
    const apiUrl = this.appConfig.get<string>('API_URL', 'No configurada');
    console.log('API_URL desde Auth con config:', apiUrl);
  }

  loginGoogle(): void {
    this.auth.loginGoogle();
  }

  loginMicrosoft(): void {
    this.auth.loginMicrosoft();
  }

  logout(): void {
    this.auth.logout();
  }

  get user() {
    console.log("Perfil de usuario:", this.auth.profile);
    return this.auth.profile;
  }

  //boolean login success o no
  get loggedIn(): boolean {
  return this.auth.isLoggedIn();
}
}
