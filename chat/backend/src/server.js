const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");

dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

let onlineUsers = 0; // Adicionado para contar os usuários online

wss.on("connection", (ws) => {
    // Incrementa o contador de usuários online quando um novo cliente se conecta
    onlineUsers++;
    console.log("Novo cliente conectado. Total de usuários online:", onlineUsers);

    // Envia o número atual de usuários online para todos os clientes
    wss.clients.forEach((client) => {
        client.send(JSON.stringify({ type: 'onlineUsers', count: onlineUsers }));
    });

    ws.on("error", (error) => {
        console.error("Erro de conexão:", error);
    });

    ws.on("close", () => {
        // Decrementa o contador de usuários online quando um cliente se desconecta
        onlineUsers--;
        console.log("Cliente desconectado. Total de usuários online:", onlineUsers);

        // Envia o número atual de usuários online para todos os clientes
        wss.clients.forEach((client) => {
            client.send(JSON.stringify({ type: 'onlineUsers', count: onlineUsers }));
        });
    });

    ws.on("message", (data) => {
        // Reenvia a mensagem recebida para todos os clientes
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });
});
