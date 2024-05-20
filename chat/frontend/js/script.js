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
    "cadetblue", "darkgoldenrod", "cornflowerblue", "darkkhaki", "hotpink", "gold"
];

const user = { id: "", name: "", color: "" };

let websocket;

// Função para criar um elemento de mensagem enviado pelo usuário
const createMessageSelfElement = (content, userName) => {
    const div = document.createElement("div");
    const span = document.createElement("span");

    div.classList.add("message--self");
    span.classList.add("message--sender");
    span.style.color = "gray";
    span.textContent = userName;
    div.appendChild(span);

    const messageContent = document.createElement("span");
    messageContent.textContent = content;
    div.appendChild(messageContent);

    return div;
};

const createMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div");
    const span = document.createElement("span");

    div.classList.add("message--other");
    span.classList.add("message--sender");
    span.style.color = senderColor;
    span.textContent = sender;

    div.appendChild(span);

    const messageContent = document.createElement("span");
    messageContent.innerHTML = content;
    div.appendChild(messageContent);

    return div;
};

const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
};

const scrollChatToBottom = () => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
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
const processCommand = (command) => responses[command] || "Comando não reconhecido.";

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

    if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify(message)); // Envia a mensagem para o servidor WebSocket
    } else {
        console.error("WebSocket não está conectado.");
    }
    scrollChatToBottom();
};

// Função para lidar com o envio de imagens
const sendImage = (event) => {
    event.preventDefault();

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*"; // Aceita apenas arquivos de imagem

    input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const imageData = event.target.result;
                const message = {
                    userId: user.id,
                    userName: user.name,
                    userColor: user.color,
                    content: imageData,
                    isImage: true // Marca a mensagem como uma imagem
                };
                if (websocket.readyState === WebSocket.OPEN) {
                    websocket.send(JSON.stringify(message)); // Envia a imagem para o servidor WebSocket
                } else {
                    console.error("WebSocket não está conectado.");
                }
            };
        }
    };

    input.click();
    scrollChatToBottom();
};

// Adicione um event listener para o clique no botão Image
const imageButton = document.querySelector(".chat__image-button");
imageButton.addEventListener("click", sendImage);

// Função para processar as mensagens recebidas
const processMessage = ({ data }) => {
    const { userId, userName, userColor, content, isImage } = JSON.parse(data);

    let message;

    if (isImage) {
        // Se a mensagem é uma imagem, crie um contêiner de imagem
        const imageContainer = document.createElement("div");
        imageContainer.classList.add("message--image-container");

        const imageElement = document.createElement("img");
        imageElement.src = content; // Defina o atributo src da imagem para a URL da imagem base64
        imageElement.classList.add("chat__message-image");

        // Adiciona evento de clique para exibir a imagem em tela cheia
        imageElement.addEventListener("click", () => {
            const fullscreenDiv = document.createElement("div");
            fullscreenDiv.classList.add("chat__image-fullscreen");

            const fullscreenImage = document.createElement("img");
            fullscreenImage.src = content;

            fullscreenDiv.appendChild(fullscreenImage);
            document.body.appendChild(fullscreenDiv);

            // Adiciona evento para sair da tela cheia ao clicar fora da imagem
            fullscreenDiv.addEventListener("click", () => {
                document.body.removeChild(fullscreenDiv);
            });
        });

        imageContainer.appendChild(imageElement);

        if (userId === user.id) {
            imageContainer.classList.add("message--self");
        } else {
            imageContainer.classList.add("message--other");
        }

        message = imageContainer;
    } else {
        const lowerContent = content.toLowerCase().trim();
        if (lowerContent.startsWith("/bot")) {
            message = createMessageOtherElement(processCommand(lowerContent), "Robozão dos Cria de ADS", "gray");
        } else {
            message = userId === user.id ?
                createMessageSelfElement(content, userName) :
                createMessageOtherElement(content, userName, userColor);
        }
    }

    chatMessages.appendChild(message);
    scrollScreen();
    scrollChatToBottom();
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
    codePopup.style.display = "block";
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
        codeConsole.innerHTML = "";

        const code = codeTextarea.value;
        const selectedLanguage = languageSelector.value;

        if (selectedLanguage === "javascript") {
            eval(code);
        } else if (selectedLanguage === "typescript") {
            const compiledCode = ts.transpile(code);
            eval(compiledCode);
        } else {
            throw new Error("Linguagem de programação não suportada.");
        }
    } catch (error) {
        console.error(error);
        codeConsole.innerHTML += "<span style='color: red;'>" + error.toString() + "</span><br>";
    }
});

// Selecione o botão de fechar
const closeBtn = document.querySelector(".code-popup__close-button");

closeBtn.addEventListener("click", () => {
    codePopup.style.display = "none";
});

// Substitua a função console.log para exibir logs no elemento codeConsole
const originalConsoleLog = console.log;
console.log = function() {
    originalConsoleLog.apply(console, arguments);
    const message = Array.from(arguments).join(",");
    codeConsole.textContent += message + "\n";
};
