import * as signalR from "@microsoft/signalr";

export function createOrderConnection() {
    return new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:7109/orderHub")
        .withAutomaticReconnect()
        .build();
}