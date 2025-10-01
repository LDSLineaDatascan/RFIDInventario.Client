import { Component } from "@angular/core";
import { AuthApi } from "../../services/auth-api";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-auth",
  templateUrl: "./auth.html",
  styleUrls: ["./auth.css"],
  imports: [CommonModule],
  standalone: true
})
export class Auth {
  constructor(private auth: AuthApi) {}

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
