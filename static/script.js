// ======================================
// CHAT STORAGE
// ======================================

let chatId = localStorage.getItem(
    "currentChatId"
);

if (!chatId) {

    chatId = crypto.randomUUID();

    localStorage.setItem(
        "currentChatId",
        chatId
    );
}

let chats = JSON.parse(
    localStorage.getItem("allChats")
) || [];

const chatContainer =
document.getElementById(
    "chatContainer"
);

const promptBox =
document.getElementById("prompt");

if(promptBox){

    promptBox.addEventListener(
    "input",
    function(){

        this.style.height = "auto";

        const maxHeight = 200;

        this.style.height =
        Math.min(
            this.scrollHeight,
            maxHeight
        ) + "px";

        if(
            this.scrollHeight >
            maxHeight
        ){

            this.style.overflowY =
            "auto";

        }
        else{

            this.style.overflowY =
            "hidden";

        }

    }
);

}

// ======================================
// SAVE CHAT LIST
// ======================================

function saveChatList() {

    localStorage.setItem(
        "allChats",
        JSON.stringify(chats)
    );

}

// ======================================
// DELETE CHAT
// ======================================

async function deleteChat(chatIdToDelete) {

    const confirmDelete = confirm(
        "Delete this chat permanently?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        await fetch(
            `http://127.0.0.1:8000/chat/${chatIdToDelete}`,
            {
                method: "DELETE"
            }
        );

        chats = chats.filter(
            chat =>
            chat.id !== chatIdToDelete
        );

        saveChatList();

        if (
            chatId === chatIdToDelete
        ) {

            chatContainer.innerHTML = `
                <div class="welcome">
                    <h1>
                        Welcome to BharaMind AI 👋
                    </h1>
                    <p>
                        Start a new conversation
                    </p>
                </div>
            `;

            chatId = crypto.randomUUID();

            localStorage.setItem(
                "currentChatId",
                chatId
            );
        }

        renderChatList();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete chat."
        );
    }
}

// ======================================
// RENDER CHAT LIST
// ======================================

function renderChatList() {

    const chatList =
    document.getElementById(
        "chatList"
    );

    chatList.innerHTML = "";

    chats.forEach(chat => {

        const item =
        document.createElement("div");

        item.className =
        "chat-item";

        item.innerHTML = `

            <span class="chat-title">
                ${chat.title}
            </span>

            <button
                class="delete-chat"
                onclick="event.stopPropagation(); deleteChat('${chat.id}')"
            >
                🗑
            </button>

        `;

        item.onclick = function () {

            loadSpecificChat(
                chat.id
            );

        };

        chatList.appendChild(
            item
        );

    });

}

// ======================================
// ADD MESSAGE
// ======================================

// ======================================
// ADD MESSAGE
// ======================================

function addMessage(text, type) {

    const welcome =
    document.querySelector(".welcome");

    if (welcome) {
        welcome.remove();
    }

    const row =
    document.createElement("div");

    const isAI =
        type === "ai" ||
        type === "assistant";

    const isFile =
        type === "file";

    row.className =
        type === "user"
        ? "message-row user-row"
        : "message-row";

    const avatar =
    document.createElement("div");

    avatar.className =
    "avatar";

    if(type === "user"){

        avatar.innerHTML = "👤";

    }
    else if(isFile){

        avatar.innerHTML = "📄";

    }
    else{

        avatar.innerHTML = "🤖";

    }

    const message =
    document.createElement("div");

    message.className =
    `message ${type}`;

    // FILE MESSAGE

    if(isFile){

        message.innerHTML =
        text;

    }

    // AI MESSAGE

    else if(isAI){

        if(
            typeof marked !==
            "undefined"
        ){

            message.innerHTML =
            marked.parse(text);

        }
        else{

            message.innerHTML =
            text.replace(
                /\n/g,
                "<br>"
            );

        }

    }

    // USER MESSAGE

    else{

        message.textContent =
        text;

    }

    // ALIGNMENT

    if(type === "user"){

        row.appendChild(
            message
        );

        row.appendChild(
            avatar
        );

    }
    else{

        row.appendChild(
            avatar
        );

        row.appendChild(
            message
        );

    }

if(isAI){

    const copyBtn =
    document.createElement("button");

    copyBtn.className =
    "copy-btn";

    copyBtn.innerHTML =
    "📋 Copy";

    copyBtn.onclick =
async function(){

    const tempMessage =
    message.cloneNode(true);

    const tempButton =
    tempMessage.querySelector(
        ".copy-btn"
    );

    if(tempButton){

        tempButton.remove();

    }

    await navigator.clipboard.write([
        new ClipboardItem({
            "text/html": new Blob(
                [tempMessage.innerHTML],
                {
                    type: "text/html"
                }
            ),
            "text/plain": new Blob(
                [tempMessage.innerText],
                {
                    type: "text/plain"
                }
            )
        })
    ]);

    copyBtn.innerHTML =
    "✅ Copied";

    setTimeout(() => {

        copyBtn.innerHTML =
        "📋 Copy";

    }, 2000);

};


    message.appendChild(
        copyBtn
    );

}

chatContainer.appendChild(
    row
);
    chatContainer.scrollTop =
    chatContainer.scrollHeight;

}

// ======================================
// LOAD CHAT
// ======================================

async function loadSpecificChat(id) {

    chatId = id;

    // Clear input when switching chats

    const input =
    document.getElementById(
        "prompt"
    );

    if(input){

        input.value = "";

        input.style.height =
        "auto";

    }

    localStorage.setItem(
        "currentChatId",
        id
    );

    try {

        const response =
        await fetch(
            `http://127.0.0.1:8000/history/${id}`
        );

        const history =
        await response.json();

        chatContainer.innerHTML =
        "";

        if (
            history.length === 0
        ) {

            chatContainer.innerHTML = `
                <div class="welcome">

                    <h1>
                        Welcome to BharaMind AI 👋
                    </h1>

                    <p>
                        How can I help you today?
                    </p>

                </div>
            `;

            return;

        }

        history.forEach(msg => {

            addMessage(
                msg.message,
                msg.role
            );

        });

    } catch (error) {

        console.error(
            "Load Chat Error:",
            error
        );

        chatContainer.innerHTML = `
            <div class="welcome">

                <h1>
                    Error Loading Chat
                </h1>

                <p>
                    Unable to load chat history.
                </p>

            </div>
        `;

    }

}

// ======================================
// SEND MESSAGE
// ======================================

async function sendMessage() {

    const input =
    document.getElementById(
        "prompt"
    );

    const message =
    input.value.trim();

    if (!message) {
        return;
    }

    const currentChat =
    chats.find(
        c => c.id === chatId
    );

    if (
        currentChat &&
        currentChat.title === "New Chat"
    ) {

        currentChat.title =
        message.substring(0, 30);

        saveChatList();

        renderChatList();
    }

    addMessage(
        message,
        "user"
    );

    input.value = "";

    const loadingRow =
    document.createElement("div");

    loadingRow.id =
    "loadingRow";

    loadingRow.className =
    "message-row";

    loadingRow.innerHTML = `

        <div class="avatar">
            🤖
        </div>

        <div class="message ai">

            <div class="typing">

                <span></span>
                <span></span>
                <span></span>

            </div>

        </div>

    `;

    chatContainer.appendChild(
        loadingRow
    );

    try {

        const response =
        await fetch(
            "http://127.0.0.1:8000/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                    "application/json"
                },

                body: JSON.stringify({

                    chat_id: chatId,

                    message: message

                })
            }
        );

        const data =
        await response.json();

        document
        .getElementById(
            "loadingRow"
        )
        ?.remove();

        addMessage(
            data.response,
            "ai"
        );

    } catch (error) {

        document
        .getElementById(
            "loadingRow"
        )
        ?.remove();

        addMessage(
            "Unable to connect to server.",
            "ai"
        );

        console.error(error);

    }
}

// ======================================
// NEW CHAT
// ======================================

// ======================================
// NEW CHAT
// ======================================

document
.getElementById("newChat")
.addEventListener(
    "click",
    function () {

        chatId =
        crypto.randomUUID();

        chats.unshift({

            id: chatId,

            title: "New Chat"

        });

        saveChatList();

        renderChatList();

        localStorage.setItem(
            "currentChatId",
            chatId
        );

        const input =
        document.getElementById(
            "prompt"
        );

        if(input){

            input.value = "";

            input.style.height =
            "auto";

        }

        chatContainer.innerHTML = `
            <div class="welcome">

                <h1>
                    Welcome to BharaMind AI 👋
                </h1>

                <p>
                    How can I help you today?
                </p>

            </div>
        `;

    }
);


// ======================================
// SEND BUTTON
// ======================================

document
.getElementById("sendBtn")
.addEventListener(
    "click",
    sendMessage
);

// ======================================
// ENTER KEY
// ======================================

document
.getElementById("prompt")
.addEventListener(
    "keydown",
    function (e) {

        if (
            e.key === "Enter" && !e.shiftKey
        ) {
            e.preventDefault();
            sendMessage();

        }

    }
);

// ======================================
// THEME
// ======================================

const themeBtn =
document.getElementById(
    "themeBtn"
);

const savedTheme =
localStorage.getItem(
    "theme"
);

if (
    savedTheme === "light"
) {

    document.body.classList.add(
        "light"
    );

    themeBtn.innerHTML =
    "☀️";
}

themeBtn.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "light"
        );

        if (
            document.body.classList.contains(
                "light"
            )
        ) {

            localStorage.setItem(
                "theme",
                "light"
            );

            themeBtn.innerHTML =
            "☀️";

        } else {

            localStorage.removeItem(
                "theme"
            );

            themeBtn.innerHTML =
            "🌙";

        }

    }
);

// ======================================
// VOICE INPUT
// ======================================

if (
    "webkitSpeechRecognition"
    in window
) {

    const recognition =
    new webkitSpeechRecognition();

    recognition.continuous =
    false;

    document
    .getElementById("voiceBtn")
    .onclick = function () {

        recognition.start();

    };

    recognition.onresult =
    function (event) {

        document
        .getElementById("prompt")
        .value =
        event.results[0][0]
        .transcript;

    };
}

// ======================================
// FILE UPLOAD
// ======================================

const fileBtn =
document.getElementById(
    "fileBtn"
);

const fileUpload =
document.getElementById(
    "fileUpload"
);

if (
    fileBtn &&
    fileUpload
) {

    fileBtn.onclick =
    function () {

        fileUpload.click();

    };

    fileUpload.addEventListener(
        "change",
        async function () {

            const file =
            this.files[0];

            if (!file) {
                return;
            }

            const formData =
            new FormData();

            formData.append(
                "file",
                file
            );

            formData.append(
                "chat_id",
                chatId
            
            );

            try {

                const response =
                await fetch(
                    "http://127.0.0.1:8000/upload",
                    {
                        method: "POST",
                        body: formData
                    }
                );

                const data =
                await response.json();

                addMessage(
                    `📄 Uploaded: ${data.filename}`,
                    "file"
                );

            } catch {

                addMessage(
                    "File Upload Failed",
                    "ai"
                );

            }

        }
    );
}

// ======================================
// STARTUP
// ======================================

window.onload = async function () {

    renderChatList();

    if(chatId){

        await loadSpecificChat(
            chatId
        );

    }

};
