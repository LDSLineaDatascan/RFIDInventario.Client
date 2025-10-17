import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from '@angular/common/http';


export interface TagTienda{
    idTienda: string;
    tag: string;
    ean: string;
    fecha: string;
}

@Injectable({ providedIn: 'root' })
export class TagApi{
    //private baseUrl: string = 'https://localhost7293';
    //private baseUrl = 'http://localhost:80/tag';
    private baseUrl = 'http://rfid.local.io:80/tag';

    constructor(private http: HttpClient) {}

    obtenerTags(idTienda?: string):Observable<TagTienda[]> {
        const url= idTienda ? `${this.baseUrl}?idTienda=${idTienda}` : this.baseUrl;
        return this.http.get<TagTienda[]>(url);
    }
}