import * as signalR from "@microsoft/signalr";

export function createOrderConnection() {
    return new signalR.HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_BASE_URL?.trim()}/orderHub`)
        .withAutomaticReconnect()
        .build();
}