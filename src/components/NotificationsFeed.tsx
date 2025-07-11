import React, { useEffect, useState } from "react";

import "../styles/notification.css";

type Notification = {
  type: "like" | "follow" | "retruth" | "comment";
  fromUser: {
    name: string;
    username: string;
    imageURL: string;
  };
  postId?: string;
  createdAt: string;
};

type NotificationProps = {
  message: string;
};

type Props = {
  currentUser: { id: string };
};

export default function NotificationsPanel({ currentUser }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  const toggleNotifications = () => {
    setNotificationsVisible((prev) => !prev);
  };
  

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/notifications?userId=${currentUser.id}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        } else {
          console.error("Erro ao buscar notificações.");
        }
      } catch (err) {
        console.error("Erro:", err);
      }
    };

    fetchNotifications();
  }, [currentUser.id]);

  const getActionText = (type: string) => {
    switch (type) {
      case "follow": return "started following you";
      case "like": return "liked your post";
      case "retruth": return "retruth'd your post";
      case "comment": return "commented on your post";
      default: return "did something";
    }
  };
 
  return (
    <div className='buttons-wrapper'>
      <div onClick={toggleNotifications} style={{ position: "relative"}}>
        <button>
          <svg width="26" height="26" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="black" aria-hidden="true" data-slot="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"></path></svg>
        </button>
        <div style={{ position: "absolute", top: "0", right: "0", width: "0.5rem", height: "0.5rem", borderRadius: "9999px", backgroundColor: "#ef4444", boxShadow: "0 0 0 2px white" }} />
      </div>

    {notificationsVisible && (
      <div style={{
        position: 'absolute',
        top: '100%',
        right:'0',
        border: '1px solid #ddd',
        borderRadius: '8px',
        width: '20rem',
        maxHeight: '20rem',
        overflowY: 'auto',
        zIndex: 1000,
      }}>
        <div className="header-notifications">
          <span className="title">Notifications</span>
        </div>
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <>
            <p style={{ color: '#666' }}>No notifications yet</p>
            <p style={{ color: '#666' }}>No notificationssssssssssssssssssssssssssssssssssssssssssss yet</p>
            <p style={{ color: '#666' }}>No notifications yet</p>
            <p style={{ color: '#666' }}>No notifications yet</p>
            <p style={{ color: '#666' }}>No notifications yet</p>
            <p style={{ color: '#666' }}>No notifications yet</p>
            <p style={{ color: '#666' }}>No notifications yet</p>
            </>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {notifications.map((n) => (
                <li key={n.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      src={n.fromUser.imageURL}
                      alt={n.fromUser.name}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', marginRight: '0.5rem' }}
                    />
                    <div>
                      <strong>{n.fromUser.name}</strong> {getActionText(n.type)}
                      {n.postId && (
                        <span style={{ color: '#888', fontSize: '0.875rem' }}> on your post</span>
                      )}
                    </div>
                  </div>
                  <small style={{ color: '#aaa' }}>{new Date(n.createdAt).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          )}
          </div>
      </div>
    )}
    </div>
  );
}
