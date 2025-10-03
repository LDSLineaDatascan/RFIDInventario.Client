import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({providedIn: 'root'})
export class SignalRService{
    //Conexión a SignalR
    private hubConnection!: signalR.HubConnection;

    //Inventario
    public onCategoriaReinicio?: (categoria: string) => void;
    public onProductoReinicio?: (idProducto: string) => void;
    public onActualizarDatos?: () => void;  

    //Usuarios (admin dashboard)
    public onUsuarioCreado?: (usuario: any) => void;
    public onUsuarioEliminado?: (id: number) => void;
    public onUsuarioActualizado?: (usuario: any) => void;
    

    public iniciarConexion(): void {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5097/notificationHub')
            .withAutomaticReconnect()
            .build();

        this.hubConnection
            .start()
            .then(() => console.log('Conexión establecida con SignalR'))
            .catch(err => console.error('Error al iniciar la conexión con SignalR: ', err));

        //******************************Eventos para inventario*******************************//

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

        //**************************Eventos para usuarios (admin dashboard)*************************//

        this.hubConnection.on("UsuarioCreado", (usuario: any) => {
            console.log("Usuario creado:", usuario);
            this.onUsuarioCreado?.(usuario);
        });

        this.hubConnection.on("UsuarioEliminado", (id: number) => {
            console.log("Usuario eliminado:", id);
            this.onUsuarioEliminado?.(id);
        });

        this.hubConnection.on("UsuarioActualizado", (usuario: any) => {
            console.log("Usuario actualizado:", usuario);
            this.onUsuarioActualizado?.(usuario);
        });

    }
    
    escucharEvento(nombreEvento: string, callback: (dato: any) => void) {
    this.hubConnection.on(nombreEvento, callback);
    }

  cerrarConexion() {
    this.hubConnection.stop();
  }

 

}