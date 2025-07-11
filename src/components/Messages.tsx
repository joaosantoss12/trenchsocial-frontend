import React, { useState, useEffect, useRef } from 'react';

import { ToastContainer, toast } from "react-toastify";
import { BadgeCheck, CircleAlert, Info, TriangleAlert } from 'lucide-react';
import { Slide } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

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
  sender: {
    id: string;
    name: string;
    username: string;
    imageURL: string;
  };
  receiver: {
    id: string;
    name: string;
    username: string;
    imageURL: string;
  };
  content: string;
  timestamp: string;
};

type Conversation = {
  id: string;
  userId: string;
  userName: string;
  userUsername: string;
  userImage: string;
  lastMessage: Message;
};

type MessagesTabProps = {
  currentUser: User;
  onOpenProfile: (username: string) => void;
};

export default function MessagesTab({ currentUser, onOpenProfile }: MessagesTabProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch(`https://trenchsocial-backend.onrender.com/api/messages/conversations/${currentUser.id}`);
        if (!res.ok) throw new Error('Failed to fetch conversations');
        const data = await res.json();
        setConversations(data);
        console.log(data);
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0]);
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchConversations();
  }, [currentUser.id]);

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    async function fetchMessages() {
      try {
        const res = await fetch(`https://trenchsocial-backend.onrender.com/api/messages/between/${currentUser.id}/${selectedConversation?.userId}`);
        if (!res.ok) throw new Error('Failed to fetch messages');
        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchMessages();
  }, [selectedConversation, currentUser.id]);


  const handleSendMessage = async (profileUserUsername: string) => {
    if (!newMessage.trim()) {
      toast.error("Message cannot be empty!", { position: "top-center", autoClose: 3000 });
      return;
    }

    try {
      const res = await fetch("https://trenchsocial-backend.onrender.com/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverUsername: profileUserUsername,
          content: newMessage,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to send message!", { position: "top-center", autoClose: 3000 });
        return;
      }

      toast.success("Message sent!", { position: "top-center", autoClose: 3000 });
      setNewMessage('');

      if (selectedConversation) {
        const resMessages = await fetch(`https://trenchsocial-backend.onrender.com/api/messages/between/${currentUser.id}/${selectedConversation.userId}`);
        if (resMessages.ok) {
          const data = await resMessages.json();
          setMessages(data);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Error sending message!", { position: "top-center", autoClose: 3000 });
    }
  };

  return (
    <>
    <ToastContainer
          aria-label="Notification Toasts"
          transition={Slide}
          icon={({ type }) => {
            // theme is not used in this example but you could
            switch (type) {
              case 'info':
                return <Info className="stroke-indigo-400" />;
              case 'error':
                return <CircleAlert className="stroke-red-500" />;
              case 'success':
                return <BadgeCheck className="stroke-green-500" />;
              case 'warning':
                return <TriangleAlert className="stroke-yellow-500" />;
              default:
                return null;
            }
          }}
        />


    <div className="messages-tab-container" style={{ paddingTop:"2rem", minHeight:"calc(100vh - 2rem)", display: 'flex', width: "90%", borderLeft:"1px solid #ccc" }}>

      <div
        className="conversations-list"
        style={{ width: '25%', borderRight: '1px solid #ccc', overflowY: 'auto' }}
      >
        {conversations.length === 0 && (
          <div style={{ padding: 10, color: '#999' }}>No conversations found.<br></br>
          Send a message by clicking on the user profile.
          </div>
        )}
        {conversations.map(conv => (
          <div
            key={conv.id}
            className={`conversation-item ${selectedConversation?.id === conv.id ? 'selected' : ''}`}
            onClick={() => setSelectedConversation(conv)}
            style={{
              cursor: 'pointer',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: selectedConversation?.id === conv.id ? 'rgba(11, 58, 246, 0.05)' : 'transparent',
              borderLeft: selectedConversation?.id === conv.id ? '4px solid  #0b93f6' : 'none',
            }}
          >
            <img
              src={conv.userImage}
              alt={conv.userName}
              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).src = '/default-profile.png'; }} // fallback imagem
            />
            <div style={{ marginLeft: 10, flex: 1, overflow: 'hidden', color:"black", backgroundColor: 'transparent' }}>
              <div
                style={{
                  fontWeight: selectedConversation?.id === conv.id ? 'bold' : 'normal',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '0.85rem',
                  backgroundColor: 'transparent',
                }}
              >
                {conv.userName}
              </div>
              <div
                style={{
                  fontSize: '0.8rem',
                  color: '#666',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  backgroundColor: 'transparent',
                }}
              >
                {conv.lastMessage.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-window" style={{  display: 'flex', flexDirection: 'column', width:"60%" }}>
        {selectedConversation ? (
          <>
            <div
              className="chat-header"
              style={{
                padding: 10,
                borderBottom: '1px solid #ccc',
                fontWeight: 'bold',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => onOpenProfile(selectedConversation.userName)}
              title={`Open profile of ${selectedConversation.userName}`}
            >
              {selectedConversation.userName}
            </div>
            <div
              className="chat-messages"
              style={{
                flexGrow: 1,
                overflowY: 'auto',
                padding: 10,
                backgroundColor: '#f9f9f9',
                scrollbarWidth: 'thin',
              }}
            >
              {messages.length === 0 && (
                <div style={{ color: '#999', textAlign: 'center', marginTop: "1rem", backgroundColor: 'transparent' }}>
                  No messages yet. Say hi!
                </div>
              )}
        
              {messages.map(msg => {
                const isCurrentUser = msg.sender.id === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                      marginBottom: 10,
                      backgroundColor: 'transparent',
                    }}
                  >

                    <div
                      style={{
                        maxWidth: '70%',
                        padding: '8px 12px',
                        borderRadius: 15,
                        backgroundColor: isCurrentUser ? '#0b93f6' : '#e5e5ea',
                        color: isCurrentUser ? 'white' : 'black',
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.9rem',
                        textAlign: 'left',
                        wordWrap: 'break-word',
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>


            <div style={{ padding: 10, borderTop: '1px solid #ccc', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSendMessage(selectedConversation.userUsername);
                }}
                placeholder="Type a message..."
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', color: 'black', backgroundColor: '#f0f0f0', borderRadius: 5, border: '1px solid #ccc' }}
              />

              <button
                onClick={() => handleSendMessage(selectedConversation.userUsername)}
                style={{
                  
                  padding: '8px 12px',
                  backgroundColor: '#0b93f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 5,
                  cursor: 'pointer',
                }}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div style={{ margin: 'auto', color: '#999' }}>Select a conversation</div>
        )}
      </div>
    </div>
    </>
  );
}
