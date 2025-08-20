import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({providedIn: 'root'})
export class SignalRService{
    private hubConnection!: signalR.HubConnection;
    public onCategoriaReinicio?: (categoria: string) => void;
    public onProductoReinicio?: (idProducto: string) => void;
    public onActualizarDatos?: () => void;  
    

    public iniciarConexion(): void {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5097/notificacionInventarios')
            .withAutomaticReconnect()
            .build();

        this.hubConnection
            .start()
            .then(() => console.log('Conexión establecida con SignalR'))
            .catch(err => console.error('Error al iniciar la conexión con SignalR: ', err));

        this.hubConnection.on('Iniciar', (idTienda: string)=>{
            console.log('Inventario iniciado para tienda:', idTienda);
        });

        this.hubConnection.on('Reiniciar', (idTienda: string)=>{
            console.log('Inventario reiniciado para tienda:', idTienda);
        });

        this.hubConnection.on('ReceiveMessage', (mensaje:string)=>{
            console.log('Mensaje recibido desde SignalR:', mensaje);
        });


        /*********************************************************** */
        this.hubConnection.on("InventarioReiniciadoPorCategoria", (categoria: string) => {
            console.log("Categoría reiniciada:", categoria);
            this.onCategoriaReinicio?.(categoria);
        });

        this.hubConnection.on("InventarioReiniciadoPorProducto", (idProducto: string) => {
            console.log("Producto reiniciado:", idProducto);
            this.onProductoReinicio?.(idProducto);
        });

        this.hubConnection.on("InventarioActualizado", () => {
            console.log("Conteo actualizado(recargado)...");
            this.onActualizarDatos?.(); 
        });

    }

    /*reiniciarDesdeCliente(idTienda: string): Promise<void> {
    return this.hubConnection.invoke('ReiniciarDesdeCliente', idTienda);
    }*/

    /*public onReiniciar(callback: (idTienda:string)=>void): void {
        this.hubConnection.on('Reiniciar', callback);
    }*/

    escucharEvento(nombreEvento: string, callback: (dato: any) => void) {
    this.hubConnection.on(nombreEvento, callback);
  }

  cerrarConexion() {
    this.hubConnection.stop();
  }

}