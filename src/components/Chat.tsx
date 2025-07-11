import React, { useState, useEffect } from "react";
import io from "socket.io-client";

import "../styles/chat.css";

import { v4 as uuidv4 } from "uuid";

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageURL: string;
  createdAt: string;

  followers: User[];
  following: User[];
  verified: boolean;
};

type Message = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  text: string;
  timestamp: string;
  replyTo?: Message;

  verified: boolean;
};

type props = {
  isGuest: boolean;
  currentUser?: User | null;

  handleOpenProfile: (username: string) => void
  onTabChange: (tab: string) => void;

  onLogout: () => void;
};


export default function Chat({ isGuest, currentUser, handleOpenProfile, onTabChange, onLogout }: props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);

const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);

  const toggleChat = () => setIsOpen(!isOpen);

   useEffect(() => {
    const socket = io("https://trenchsocial-backend.onrender.com/");
    setSocket(socket);

    socket.on("loadMessages", (loadedMessages: Message[]) => {
      setMessages(loadedMessages);
    });
    
    socket.on("receiveMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

      return () => {
      socket.off("loadMessages");
      socket.off("receiveMessage");
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || trimmed.length > 250) return;

    const now = new Date();
    const timestamp = now.toISOString();

    const newMessage: Message = {
        id: uuidv4(),
        name: currentUser!.name,
        username: currentUser!.username,
        avatarUrl: currentUser!.imageURL,
        text: trimmed,
        timestamp,
        replyTo: replyTo || undefined,
    };


    //setMessages([...messages, newMessage]);
    socket!.emit("sendMessage", newMessage);
    setInput("");
    setReplyTo(null); 
    };

  const formatTimestamp = (isoDate: string) => {
    const date = new Date(isoDate);
    const time = date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const day = date.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `${time} · ${day}`;
  };

  return (
    <div className="chat-container">
      <div
        className="chat-header"
        onClick={toggleChat}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") toggleChat();
        }}
        aria-expanded={isOpen}
      >
        <h3 className="chat-title">Degen Chat</h3>
        <span className="chat-toggle-icon">{isOpen ? "▼" : "▲"}</span>
      </div>

      {isOpen && (
        <div className="chat-body">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <p className="chat-empty">No messages</p>
            ) : (
              messages.map((message) => {
                  const isOwnMessage = message.username === currentUser?.username;
                return(
                <div>
                <div className="chat-message" key={message.id} style={{ display: "flex", gap: "10px", marginBottom: "0.7rem" }}>
                  <img src={message.avatarUrl} alt="avatar" className="chat-avatar" style={{order: isOwnMessage ? 1 : 0}}/>

                  <div className="chat-message-content" style={{backgroundColor: isOwnMessage ? "#e6e6ff" : "#f3f4f6"}}>
                    {/* Reply Box */}
                    {message.replyTo && (
                        <div className="chat-reply-box">
                            <strong style={{ backgroundColor: "transparent" }}>
                                ↪ {message.replyTo.name}
                            </strong>
                            : {message.replyTo.text.length > 20
                                ? message.replyTo.text.slice(0, 20) + "..."
                                : message.replyTo.text}
                        </div>
                    )}

                    <div className="nametimestamp" style={{ fontSize: "0.75rem", color: "#6B7280", backgroundColor: "transparent"}}>
                      <span style={{backgroundColor:"transparent", display: "flex", flexDirection:"column"}}>
                        <span className="message-name" style={{color:"black", fontSize:"0.9rem", backgroundColor:"transparent", display:"inline-flex", alignItems:"center", gap:"0.15em"}} onClick={() => {handleOpenProfile(message.username); onTabChange("profile")}}>
                          {message.name}
                          {message.verified && (
                              <svg
                                width="1.2em"
                                height="1.2em"
                                style={{ backgroundColor: "transparent" }}
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="blue"
                              >
                                <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path>
                              </svg>
                            )}
                        </span>
                          <div style={{backgroundColor:"transparent"}}>
                            {formatTimestamp(message.timestamp)}

                            {!isOwnMessage && (
                              <button style={{marginLeft:"0.65rem"}} onClick={() => setReplyTo(message)} className="chat-reply-button" title="Reply">
                                Reply
                              </button>
                            )}
                          </div>
                      </span>
                      
                    </div>

                    <div className="chat-text">{message.text}</div>
                  </div>
                    
                </div>

              </div>
                );
          })
        )}
          </div>
            
          {isGuest &&(
            <div className="chat-reply-preview">
              <p>
                You are currently in guest mode. Please
                <button onClick={() => onLogout()} style={{border:"none", color:"blue", cursor:"pointer"}} className="chat-login-link">log in</button> to send messages.
              </p>
            </div>
          )}

          {!isGuest && (
            <>
                {replyTo && (
                <div className="chat-reply-preview">
                    Replying to <strong>{replyTo.name}</strong>: {replyTo.text.slice(0, 50)}...
                    <button onClick={() => setReplyTo(null)} className="chat-cancel-reply">×</button>
                </div>
                )}

                <form
                className="chat-input-area"
                onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                }}
                >
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Write a message..."
                    className="chat-input"
                    aria-label="Write your message"
                    maxLength={250}
                />

                <button type="submit" className="chat-send-button">
                    <svg style={{ backgroundColor: "transparent" }} width="24" height="24" fill="#5548EF" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"></path>
                    </svg>
                </button>
                </form>

                <div className="char-counter">{input.length} / 250</div>
            </>
            )}
        </div>
      )}
    </div>
  );
}
