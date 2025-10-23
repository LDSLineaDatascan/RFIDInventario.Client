import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from '@angular/common/http';
import { environment } from "../../environments/environment";
import { AppConfigService } from "./app-config-service";


export interface TagTienda{
    idTienda: string;
    tag: string;
    ean: string;
    fecha: string;
}

@Injectable({ providedIn: 'root' })
export class TagApi{
    //private baseUrl: string = 'https://localhost7293';
    //private baseUrl = 'http://localhost:5097/tag';
    //private baseUrl = `${environment.API_URL}/tag`;
    private baseUrl: string = '';

    constructor(private http: HttpClient, private appConfigService: AppConfigService) {
        const apiUrl = this.appConfigService.get<string>('API_URL', `${environment.API_URL}`);
        this.baseUrl = `${apiUrl}/tag`;
        console.log("API URL Tag con config:", this.baseUrl);
    }

    obtenerTags(idTienda?: string):Observable<TagTienda[]> {
        const url= idTienda ? `${this.baseUrl}?idTienda=${idTienda}` : this.baseUrl;
        return this.http.get<TagTienda[]>(url);
    }
}