// login elements
const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const loginInput = login.querySelector(".login__input");

// chat elements
const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const chatMessages = chat.querySelector(".chat__messages");

const colors = [
    "cadetblue",
    "darkgoldenrod",
    "cornflowerblue",
    "darkkhaki",
    "hotpink",
    "gold"
];

const user = { id: "", name: "", color: "" };

let websocket;

// Função para criar um elemento de mensagem enviado pelo usuário
const createMessageSelfElement = (content, userName) => {
    const div = document.createElement("div");
    const span = document.createElement("span");

    // Adiciona a classe CSS para estilizar a mensagem
    div.classList.add("message--self");

    // Cria um span para exibir o nome do usuário
    span.classList.add("message--sender");
    span.style.color = "gray"; // Define a cor do nome do usuário
    span.textContent = userName; // Define o nome do usuário

    // Adiciona o span com o nome do usuário ao balão de mensagem
    div.appendChild(span);

    // Cria um span para exibir o conteúdo da mensagem
    const messageContent = document.createElement("span");
    messageContent.textContent = content; // Define o conteúdo da mensagem
    div.appendChild(messageContent); // Adiciona o span com o conteúdo da mensagem ao balão de mensagem

    return div;
};

const createMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div");
    const span = document.createElement("span");

    div.classList.add("message--other");

    span.classList.add("message--sender");
    span.style.color = senderColor;

    div.appendChild(span);

    span.innerHTML = sender;
    div.innerHTML += content;

    return div;
};

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
};

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
};

const responses = {
    "/bot": "Olá sou o Robozão dos Cria de ADS, posso ajudar com alguns dos comandos abaixo:<br>" +
        "<br>- /bot o que é algoritmo?<br>" +
        "- /bot o que é javascript?<br>" +
        "- /bot qual a diferença entre java e javascript?<br>" +
        "- /bot o que é html?<br>" +
        "- /bot qual a diferença entre css e html?",
    "/bot o que é algoritmo?": "É uma sequência finita de ações executáveis que visam obter uma solução para um determinado tipo de problema.",
    "/bot o que é javascript?": "JavaScript é uma linguagem de programação amplamente utilizada para criar páginas web interativas.",
    "/bot qual a diferença entre java e javascript?": "Java e JavaScript são linguagens de programação diferentes. Java é uma linguagem de programação de propósito geral, enquanto JavaScript é principalmente usada para desenvolvimento web.",
    "/bot o que é html?": "HTML (HyperText Markup Language) é a linguagem padrão para criação de páginas web. Ele define a estrutura básica e o conteúdo de uma página web.",
    "/bot qual a diferença entre css e html?": "HTML é usado para definir a estrutura e o conteúdo de uma página web, enquanto CSS (Cascading Style Sheets) é usado para estilizar a página e controlar o layout."
};

// Função para processar os comandos
function processCommand(command) {
    return responses[command] || "Comando não reconhecido.";
}

// Função para enviar uma mensagem de chat
const sendMessage = (event) => {
    event.preventDefault();

    const messageContent = chatInput.value.trim();
    if (!messageContent) return; // Não envia mensagem vazia

    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: messageContent
    };

    chatInput.value = ""; // Limpa o campo de entrada de mensagem

    websocket.send(JSON.stringify(message)); // Envia a mensagem para o servidor WebSocket
};

// Função para processar as mensagens recebidas
const processMessage = ({ data }) => {
    const { userId, userName, userColor, content } = JSON.parse(data);

    let message;

    const lowerContent = content.toLowerCase().trim();
    if (lowerContent.startsWith("/bot")) {
        // Processa comando do bot
        message = createMessageOtherElement(processCommand(lowerContent), "Robozão dos Cria de ADS", "gray");
    } else if (responses[lowerContent]) {
        // Processa resposta automática
        message = createMessageOtherElement(responses[lowerContent], "Robozão dos Cria de ADS", "gray");
    } else {
        // Processa mensagem normal
        message = userId === user.id ? createMessageSelfElement(content, userName) :
            createMessageOtherElement(content, userName, userColor);
    }

    chatMessages.appendChild(message);

    scrollScreen();
};

// Função para processar mensagens do bot
const processBotMessage = (content) => {
    let message;

    if (responses[content]) {
        // Responde com a mensagem do bot
        message = createMessageOtherElement(responses[content], "Robozão dos Cria de ADS", "gray");
        chatMessages.appendChild(message);
        scrollScreen();
    } else {
        // Comando do bot inválido
        console.error("Comando do bot inválido:", content);
    }
};

// Função para processar mensagens do usuário
const processUserMessage = (userId, userName, userColor, content) => {
    // Verifica se é um comando do usuário
    if (content.startsWith("/")) {
        // Comando inválido
        const invalidCommandMessage = "Comando inválido. Use '/bot' para interagir com o bot.";
        const invalidCommand = createMessageOtherElement(invalidCommandMessage, "Robozão dos Cria de ADS", "gray");
        chatMessages.appendChild(invalidCommand);
        scrollScreen();
    } else {
        // Mensagem normal do usuário
        const message = userId === user.id ? createMessageSelfElement(content, userName) :
            createMessageOtherElement(content, userName, userColor);
        chatMessages.appendChild(message);
        scrollScreen();
    }
};

// Lida com o evento de login
loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    user.name = loginInput.value.trim();
    if (!user.name) return;

    user.id = new Date().getTime(); // Cria um ID único para o usuário
    user.color = getRandomColor();

    login.style.display = "none";
    chat.style.display = "block";

    websocket = new WebSocket("wss://chatcode-4p2g.onrender.com");

    websocket.onopen = () => {
        console.log("Conectado ao servidor WebSocket");
    };

    websocket.onmessage = processMessage;

    websocket.onclose = () => {
        console.log("Desconectado do servidor WebSocket");
    };

    websocket.onerror = (error) => {
        console.error("Erro no WebSocket", error);
    };
});

// Lida com o envio de mensagens de chat
chatForm.addEventListener("submit", sendMessage);


// Adicione um event listener para o clique no botão Code
const codeButton = document.querySelector(".chat__code-button");
const codePopup = document.querySelector(".code-popup");

codeButton.addEventListener("click", () => {
    // Exiba a tela quadrada quando o botão Code for clicado
    codePopup.style.display = "block";
    // Limpe o console quando a tela de código for aberta
    codeConsole.textContent = "";
});

// Selecione o textarea, o botão e o console
const codeTextarea = document.querySelector(".code-popup__textarea");
const codeConsole = document.getElementById("code-popup-console");
const languageSelector = document.querySelector(".code-popup__language-selector");
const codeButtonExecutar = document.querySelector(".code-popup__button");

// Adicione um event listener para o clique no botão Executar
codeButtonExecutar.addEventListener("click", () => {
    try {
        // Limpe a saída anterior do console
        codeConsole.textContent = "";

        // Obtenha o código inserido no textarea
        const code = codeTextarea.value;

        // Obtenha a linguagem selecionada pelo usuário
        const selectedLanguage = languageSelector.value;

        // Verifique a linguagem selecionada e execute o código correspondente
        if (selectedLanguage === "javascript") {
            // Se a linguagem selecionada for JavaScript, execute o código diretamente
            eval(code);
        } else if (selectedLanguage === "typescript") {
            // Se a linguagem selecionada for TypeScript, compile o código para JavaScript e execute
            // Compila o código TypeScript para JavaScript
            const compiledCode = ts.transpile(code);
            // Execute o código JavaScript compilado
            eval(compiledCode);
        } else {
            // Se a linguagem selecionada não for reconhecida, exiba uma mensagem de erro
            throw new Error("Linguagem de programação não suportada.");
        }
    } catch (error) {
        // Em caso de erro, exiba o erro no console
        console.error(error);
        codeConsole.textContent = error.toString();
    }
});

// Selecione o botão de fechar
const closeBtn = document.querySelector(".code-popup__close-button");

// Adicione um event listener para o clique no botão de fechar
closeBtn.addEventListener("click", () => {
    // Oculte a janela quando o botão de fechar for clicado
    codePopup.style.display = "none";
});

// Substitua a função console.log para exibir logs no elemento codeConsole
const originalConsoleLog = console.log;
console.log = function() {
    // Chame a função original console.log para exibir o log no console do navegador
    originalConsoleLog.apply(console, arguments);

    // Construa a mensagem combinando todos os argumentos separados por vírgula
    const message = Array.from(arguments).join(",");

    // Adicione o log ao elemento codeConsole
    codeConsole.textContent += message + "\n";
};
