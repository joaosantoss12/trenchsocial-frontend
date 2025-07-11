import React, { useEffect, useState } from "react";

import VerifyPopup from "./VerifyPopup";

import "../styles/profile.css";

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

type Post = {
  id: string;
  name: string;
  username: string;
  imageURL: string;
  text: string;
  likes: User[];
  retruths: User[];
  comments: Comment[];
  createdAt: Date;
  images?: string[];
}

type props = {
  currentUser: User;
  profileUser?: User | null;
  handleUpdate?: (updatedData: { name: string; email: string; imageFile?: File }) => Promise<void>;
  isOtherUser?: boolean;
  isGuest: boolean;
  onTabChange?: (tab: "home" | "profile" | "live" | "leaderboard" | "settings") => void;

  handleOpenProfile: (username: string) => void
};

export default function Profile({currentUser, profileUser, handleUpdate, isOtherUser = false, isGuest, onTabChange, handleOpenProfile}: props) {
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "followers" | "following">("posts");
  const [showEditModal, setShowEditModal] = useState(false);

  const [editedName, setEditedName] = useState(currentUser.name);
  const [editedEmail, setEditedEmail] = useState(currentUser.email);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(currentUser.imageURL);

  useEffect(() => {
    onTabChange?.("profile");
  }, []); 

  useEffect(() => {
 
    const fetchUserPosts = async () => {
      try {
        const res = await fetch(`https://trenchsocial-backend.onrender.com/api/posts`);
        if (res.ok) {
          const data = await res.json();
          if(profileUser){
            const filteredPosts = data.filter((post: Post) => post.username === profileUser!.username);
            setUserPosts(filteredPosts);
            return;
          }
          const filteredPosts = data.filter((post: Post) => post.username === currentUser.username);
          setUserPosts(filteredPosts);
        } else {
          console.error("Failed to fetch user posts");
        }
      } catch (error) {
        console.error("Error fetching user posts:", error);
      }
    };
    fetchUserPosts();
  }, [currentUser]);

  const formatJoinedDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const res = await fetch(`https://trenchsocial-backend.onrender.com/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("Failed to delete post!", { position: "top-center", autoClose: 3000 });
        return;
      }

      setUserPosts(prev => prev.filter(post => post.id !== postId));

      toast.success("Post deleted successfully!", { position: "top-center",autoClose: 3000,hideProgressBar: false,closeOnClick: true,pauseOnHover: false,draggable: false,theme: "light"});
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleUpdate({
      name: editedName,
      email: editedEmail,
      imageFile: selectedImage ?? undefined,
    });
    setShowEditModal(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };


  const handleFollow = async () => {
    try {
      const res = await fetch(`https://trenchsocial-backend.onrender.com/api/users/${profileUser!.username}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          followerId: currentUser.id,
          followerName: currentUser.name,
          followerUsername: currentUser.username,
          followerImageURL: currentUser.imageURL,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to follow user!", { position: "top-center", autoClose: 3000 });
        return;
      }

      toast.success("Successfully followed! Refresh the page!", { position: "top-center", autoClose: 3000 });
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while following the user.", { position: "top-center", autoClose: 3000 });
    }
  };

  const handleUnfollow = async () => {
    try {
      const res = await fetch(`https://trenchsocial-backend.onrender.com/api/users/${profileUser!.username}/unfollow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          followerId: currentUser.id,
          followerName: currentUser.name,
          followerUsername: currentUser.username,
          followerImageURL: currentUser.imageURL,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to unfollow user!", { position: "top-center", autoClose: 3000 });
        return;
      }

      toast.success("Successfully unfollowed! Refresh the page!", { position: "top-center", autoClose: 3000 });
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while following the user.", { position: "top-center", autoClose: 3000 });
    }
  };


  const [showVerifyPopup, setShowVerifyPopup] = useState(false);


  // Novo state para controlar modal de mensagem
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");

  const handleSendMessage = async (profileUserUsername: string) => {
    if (!messageText.trim()) {
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
          content: messageText,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to send message!", { position: "top-center", autoClose: 3000 });
        return;
      }

      toast.success("Message sent!", { position: "top-center", autoClose: 3000 });
      setMessageText("");
      setShowMessageModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Error sending message!", { position: "top-center", autoClose: 3000 });
    }
  };

  const onCloseSendMessageModal = () => {
    setShowMessageModal(false);
    setMessageText("");
  }


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

      <div className="profile-side">
        <div className="main-div">
          <div className="header">
            <span className="title">Profile</span>
          </div>

          <div className="profile-card">

            {!isOtherUser && (
            <button className="edit-profile-btn" onClick={() => setShowEditModal(true)}>
              Edit
              <svg fill="white" width="1em" height="1em" style={{backgroundColor:"transparent"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"/></svg>            
            </button>
            )}
            

            {showEditModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h2>Edit Profile</h2>
                  <form
                    onSubmit={onSubmit}
                  >
                    <label>
                      Name:
                      <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)}/>
                    </label>
                    <label>
                      Email:
                      <input type="text" value={editedEmail} onChange={(e) => setEditedEmail(e.target.value)}/>
                    </label>
                    <label>
                      Profile Image:
                      <input type="file" accept="image/*" onChange={handleImageChange}
                      />
                    </label>

                    {previewImage && (
                      <img
                        src={previewImage}
                        alt="Preview"
                        style={{width: "80px",height: "80px",objectFit: "cover",borderRadius: "50%",marginTop: "10px"}}
                      />
                    )}

                    <div style={{ marginTop: "15px" }}>
                      <button type="submit">Save</button>
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        style={{ marginLeft: "10px" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <img src={profileUser ? profileUser.imageURL : currentUser.imageURL} className="avatar" alt="Profile" />

            {showVerifyPopup && <VerifyPopup onClose={() => setShowVerifyPopup(false)} currentUser={currentUser} />}

            <div className="name-row">

              <span className="name" style={{display: "inline-flex",alignItems: "center",gap: "0.15em",textDecoration:"none"}}>
                {profileUser ? profileUser.name : currentUser.name}

                {profileUser ? (
                  profileUser.verified && (
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
                  )
                ) : (
                  currentUser.verified && (
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
                  )
                )}

              </span>

              {!currentUser.verified && !isOtherUser && (
                <button className="get-verified-btn" onClick={() => setShowVerifyPopup(true)}>
                  Get Verified
                  <svg width="1.2em" height="1.2em" style={{backgroundColor:"transparent"}} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></svg>                
                </button>
              )}

              {isOtherUser && !isGuest && (
                profileUser!.followers.some(f => f.id === currentUser.id) ? (
                  <div style={{backgroundColor:"transparent", display:"flex",flexDirection:"column",alignItems:"center"}}>
                  <button className="get-verified-btn" onClick={() => handleUnfollow()}>
                    Unfollow
                    <svg width="1.2em" height="1.2em" fill="white" style={{ backgroundColor: "transparent" }} viewBox="0 0 640 512">
                      <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM472 200l144 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-144 0c-13.3 0-24-10.7-24-24s10.7-24 24-24z"/>                  
                    </svg>
                  </button>

                   <button
                    className="get-verified-btn"
                    style={{ marginTop: "10px" }}
                    onClick={() => setShowMessageModal(true)}
                  >
                    Send Message
                  </button>
                  </div>
                ) : (
                  <div style={{backgroundColor:"transparent", display:"flex",flexDirection:"column",alignItems:"center"}}>
                  <button className="get-verified-btn" onClick={() => handleFollow()}>
                    Follow
                    <svg width="1.2em" height="1.2em" fill="white" style={{ backgroundColor: "transparent" }} viewBox="0 0 640 512">
                      <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM504 312l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/>
                    </svg>
                  </button>

                   <button
                    className="get-verified-btn"
                    style={{ marginTop: "10px" }}
                    onClick={() => setShowMessageModal(true)}
                  >
                    Send Message
                  </button>
                  </div>
                )
              )}
            </div>

            {showMessageModal && (
              <div className="modal-overlay">
                <div className="modal-content" style={{ position: "relative" }}>

                  <button 
                    onClick={onCloseSendMessageModal}
                    style={{
                      position: "absolute",
                      top: "0.5rem",
                      right: "0",
                      background: "none",
                      border: "none",
                      fontSize: "1rem",
                      cursor: "pointer",
                      color: "#666",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "auto",
                      height: "auto"
                    }}
                  >
                    ❌
                  </button>

                  <span style={{fontSize:"1.3rem", backgroundColor:"transparent"}}>Send Message to @{profileUser?.username}</span>
                  <textarea
                    rows={7}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message here..."
                    style={{ width: "95%", padding: "10px", marginTop:"0.9rem", color:"black" }}
                  />
                  <div style={{ marginTop: "0.5rem", display: "flex", justifyContent: "flex-end", alignItems:"center" }}>
                    <button onClick={() => handleSendMessage(profileUser!.username)}>
                      <svg style={{ backgroundColor: "transparent" }} width="24" height="24" fill="#5548EF" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}


            <p className="username">@{profileUser ? profileUser.username : currentUser.username}</p>
            <p className="joined">Joined {formatJoinedDate(profileUser ? profileUser.createdAt : currentUser.createdAt)}</p>

            <div className="follow-stats">
              <span><strong>{profileUser ? profileUser.followers.length : currentUser.followers.length}</strong> Followers</span>
              <span><strong>{profileUser ? profileUser.following.length : currentUser.following.length}</strong> Following</span>
            </div>
          </div>

          {/* --- TAB BUTTONS --- */}
          <div className="tab-buttons">
            <button
              style={{color:"white"}}
              className={`tab-btn ${activeTab === "posts" ? "active" : ""}`}
              onClick={() => setActiveTab("posts")}
            >
              Posts
            </button>
            <button
              style={{color:"white"}}
              className={`tab-btn ${activeTab === "followers" ? "active" : ""}`}
              onClick={() => setActiveTab("followers")}
            >
              Followers
            </button>
            <button
              style={{color:"white"}}
              className={`tab-btn ${activeTab === "following" ? "active" : ""}`}
              onClick={() => setActiveTab("following")}
            >
              Following
            </button>
          </div>

          {/* --- TAB CONTENT --- */}
          <div className="tab-content">
            {activeTab === "posts" && (
              userPosts.length === 0 ? (
                <p style={{ textAlign: "center", color: "#777" }}>No posts yet.</p>
              ) : (
                userPosts.map(post => (
                  <div className="post-card-profile" key={post.id + 'profile'}>
                    {(post.username === currentUser.username)  &&  (!isGuest) &&(
                      <button className="delete-post-button" onClick={() => handleDeletePost(post.id)}>
                      <svg style={{backgroundColor:"transparent"}} stroke="currentColor" fill="white" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"></path></svg>                      </button>
                    )}

                    <div className="post-header">
                      <img src={post.imageURL} alt="profile" className="profile-img" />
                      <div className="post-meta">
                        <span className="name" style={{backgroundColor:"transparent"}}>
                          {post.name}
                        </span>
                        <span className="nametimestamp" style={{backgroundColor:"transparent"}}>
                          @{post.username} · {new Date(post.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <p className="post-text">{post.text}</p>
                    {post.images?.length! > 0 && (
                      <div className={`post-images ${getImageLayoutClass(post.images!.length)}`}>
                        {post.images!.map((img, i) => (
                          <div className="post-image-wrapper" key={i}>
                            <img src={img} alt={`post-img-${i}`} />
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      style={{
                      display: "flex",
                      gap: 8,
                      fontSize: 12,
                      color: "#6B7280", // gray-500
                      alignItems: "center",
                      }}
                  >
                      <span style={{backgroundColor:"transparent"}}>{post.likes.length}{post.likes.length === 1 ? " like" : " likes"}</span>
                      <span style={{backgroundColor:"transparent"}}>{post.retruths.length}{post.retruths.length === 1 ? " retruth" : " retruths"}</span>
                      <span style={{backgroundColor:"transparent"}}>{post.comments.length}{post.comments.length === 1 ? " comment" : " comments"}</span>
                  </div>

                  </div>
                ))
              )
            )}

            {activeTab === "followers" && (
              <div className="followers-list">
                {(profileUser ? profileUser.followers.length : currentUser.followers.length) === 0 ? (
                  <p style={{ textAlign: "center", color: "#777" }}>No followers yet.</p>
                ) : (
                  (profileUser ? profileUser.followers : currentUser.followers).map(f => (
                    <div key={f.id} className="user-card">
                      <img src={f.imageURL} alt="follower" className="profile-img" />
                      <div className="user-info" onClick={() => handleOpenProfile(f.name)} style={{cursor: "pointer"}}>
                        <strong>{f.name}</strong> <span style={{backgroundColor:"transparent"}}>@{f.username}</span>
                      </div>

                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "following" && (
              <div className="followers-list">
                {(profileUser ? profileUser.following.length : currentUser.following.length) === 0 ? (
                  <p style={{ textAlign: "center", color: "#777" }}>Not following anyone yet.</p>
                ) : (
                  (profileUser ? profileUser.following : currentUser.following).map(f => (
                    <div key={f.id} className="user-card">
                      <img src={f.imageURL} alt="following" className="profile-img" />
                      <div className="user-info" onClick={() => handleOpenProfile(f.name)} style={{cursor: "pointer"}}>
                        <strong>{f.name}</strong> <span style={{backgroundColor:"transparent"}}>@{f.username}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function getImageLayoutClass(count: number) {
  if (count === 1) return "one";
  if (count === 2) return "two";
  return "three";
}
