import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserDashboardServices {

  private apiUrl = 'http://localhost:5097/api/user/dashboard';

  constructor(private http: HttpClient) { }

  getDashboardUser(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
