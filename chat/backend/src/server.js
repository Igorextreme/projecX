const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");
const { exec } = require("child_process");

dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

wss.on("connection", (ws) => {
    ws.on("error", console.error);

    ws.on("message", (data) => {
        const message = JSON.parse(data);

        // Verifica se a mensagem é um objeto
        if (typeof message === "object") {
            // Se a mensagem for uma imagem, envie-a para todos os clientes conectados
            if (message.type === "image") {
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(message));
                    }
                });
            } else {
                // Caso contrário, encaminha a mensagem para todos os clientes
                wss.clients.forEach((client) => client.send(JSON.stringify(message)));
            }
        } else {
            // Se a mensagem não for um objeto, encaminha-a para todos os clientes
            wss.clients.forEach((client) => client.send(data));
        }
    });

    console.log("Client connected");
});
