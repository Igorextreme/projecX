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

const createMessageSelfElement = (content) => {
    const div = document.createElement("div");

    div.classList.add("message--self");
    div.innerHTML = content;

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

const processMessage = ({ data }) => {
    const { userId, userName, userColor, content } = JSON.parse(data);

    const message =
       userId === user.id ? createMessageSelfElement(content) :
       createMessageOtherElement(content, userName, userColor);

    chatMessages.appendChild(message);

    scrollScreen();
};

const handleLogin = (event) => {
    event.preventDefault();

    user.id = crypto.randomUUID();
    user.name = loginInput.value;
    user.color = getRandomColor();

    login.style.display = "none";
    chat.style.display = "flex";

    websocket = new WebSocket("wss://chatcode-4p2g.onrender.com");
    websocket.onmessage = processMessage;
};

const sendMessage = (event) => {
    event.preventDefault();

    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value
    };

    websocket.send(JSON.stringify(message));

    chatInput.value = "";
};

loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);

// Selecione o botão Code
const codeButton = document.querySelector(".chat__code-button");
// Selecione a tela quadrada
const codePopup = document.getElementById("code-popup");

// Adicione um event listener para o clique no botão Code
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
const closeBtn = document.querySelector(".code-popup__close-btn");

// Adicione um event listener para o clique no botão de fechar
closeBtn.addEventListener("click", () => {
    // Oculte a janela quando o botão de fechar for clicado
    codePopup.style.display = "none";
});

// Substitua a função console.log para exibir logs no elemento codeConsole
const originalConsoleLog = console.log;
console.log = function(message) {
    // Chame a função original console.log para exibir o log no console do navegador
    originalConsoleLog.apply(console, arguments);

    // Adicione o log ao elemento codeConsole
    codeConsole.textContent += message + "\n";
};
