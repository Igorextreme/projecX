const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");
const { exec } = require("child_process");

dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

wss.on("connection", (ws) => {
    ws.on("error", console.error);

    ws.on("message", (data) => {
        const message = data.toString();

        // Se a mensagem começa com "/code", trata-se de um comando para executar código
        if (message.startsWith("/code")) {
            const code = message.slice(6); // Remove o prefixo "/code "

            // Executa o código
            exec(code, (error, stdout, stderr) => {
                if (error) {
                    ws.send(`Erro ao executar o código: ${error.message}`);
                    return;
                }
                if (stderr) {
                    ws.send(`Erro ao executar o código: ${stderr}`);
                    return;
                }
                ws.send(`Saída do código: ${stdout}`);
            });
        } else {
            // Caso contrário, encaminha a mensagem para todos os clientes
            wss.clients.forEach((client) => client.send(message));
        }
    });

    console.log("Client connected");
});
