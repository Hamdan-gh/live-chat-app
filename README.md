live view https://live-chat-app-1-k7g0.onrender.com/

# Live-Chat-App

A real-time **Live Chat Application** built with Node.js, Socket.io, and a client-server frontend architecture. This app enables users to send and receive messages instantly — perfect as a learning project for real-time communication systems or as a foundation for larger chat platforms.

---

## 🧠 Overview

The **Live Chat App** is a web-based messaging application that supports real-time text conversations between connected users.
It combines a backend server to manage connections and message broadcasts with a frontend chat interface that updates dynamically as users send messages.

This project demonstrates how to build and integrate real-time communication using WebSockets via **Socket.io**.

---

## 📌 Features

* 🔄 Real-time messaging
* 💬 Multiple users supported simultaneously
* 🚀 Fast, socket-based communication
* 🧩 Modular frontend and backend architecture
* 📚 Clean, simple structure for learning and extension

---

## 🛠️ Tech Stack

The application is developed using:

**Frontend**

* HTML
* CSS
* JavaScript

**Backend**

* Node.js
* Express.js
* Socket.io

This combo allows bidirectional real-time communication between clients and server with minimal setup.

---

## 📁 Project Structure

```
live-chat-app/
├── backend/                # Server code
├── chat-frontend/          # Client UI and chat logic
├── bin/                    # Helper scripts
├── SOCKET_IMPLEMENTATION.md
├── README.md
└── package.json
```

---

## ⚙️ Setup & Installation

### 🧩 Requirements

* Node.js (v14 or higher recommended)
* npm or yarn

---

### 🛠️ Steps to Run Locally

1. **Clone the repository**

   ```bash
   git clone https://github.com/Hamdan-gh/live-chat-app.git
   cd live-chat-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the server**

   ```bash
   npm start
   ```

4. **Open the frontend**

   * If you have a browser setup that serves static files, open the `chat-frontend/index.html`
   * Or use Live Server (VS Code) to serve the frontend

Once open, multiple users connecting in the same network can send and receive messages instantly.

---

## 🔄 How It Works

* The **backend** initializes a Socket.io server.
* Clients connect and emit a `message` event when they send text.
* The server listens for incoming messages and **broadcasts** them to all connected clients.
* Each client listens for new messages and updates the UI in real time.

---

## 📌 Socket Implementation

For details on how sockets are set up and integrated between the frontend and backend, see `SOCKET_IMPLEMENTATION.md`.

This includes:

* Event names
* Emitted data formats
* How messages are broadcasted

---

## 🛠️ Customization Ideas

Want to extend this project? Here are some ideas:

* Add **usernames**
* Enable **private messaging**
* Add **chat rooms**
* Store messages to a **database**
* Add **authentication**

---

## 🤝 Contributing

Contributions are welcome! You can:

1. ⭐ Star the repository
2. Fork the project
3. Create a feature branch
4. Submit a pull request

---

## 📬 Contact

Created by **Hamdan-gh** — feel free to reach out for questions, help, or project improvements.

---

## 📜 License

This project is **open source** and available for educational and development use.

