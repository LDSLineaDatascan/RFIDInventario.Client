import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';


export class AppConfig {
    API_URL?: string;
    someFeatureEnable?: boolean;
    [key: string]: any;
}

@Injectable({
    providedIn: 'root'
})

export class AppConfigService {
    private config: AppConfig | null = null;

    // Cargar configuración desde el archivo JSON
    //private readonly EXTERNAL_PATH = '/app-config.json';
    private readonly CONFIG_PATH = 'assets/app-config.json';

    constructor(private http: HttpClient) { }

    loadConfig(): Promise<void> {
        return lastValueFrom(this.http.get<AppConfig>(this.CONFIG_PATH))
            .then(config => {
                this.config = config;
                console.log("Configuración cargada App-Config:", this.config);
            })
            .catch(() => {
                // Si falla, intentar cargar desde assets
                return lastValueFrom(this.http.get<AppConfig>(this.CONFIG_PATH))
                    .then(config => {
                        this.config = config;
                        console.log("Configuración cargada Assets:", this.config);
                    })
                    //si no se carga ninguna, queda null 
                    .catch(error => {
                        console.error('No se pudo cargar la configuración de la aplicación desde ninguna ruta.', error);
                        return Promise.reject(error);
                    });
            }).then(() => undefined);
    }

    getConfig(): AppConfig | null {
        return this.config;
    }

    get<T = any>(key:string, fallback?: T): T | undefined {
        if(!this.config) return fallback;
        const val = (this.config as any)[key];
        return val !== undefined ? val as T : fallback;
    }
}