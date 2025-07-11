import React, { useState, useEffect } from "react";

import "../styles/main.css";

import PostInput from "./PostInput";

import "../styles/main.css";

import { v4 as uuidv4 } from "uuid";

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

type Comment = {
  id: string;
  name: string;
  username: string;
  imageURL: string;
  text: string;
  createdAt: Date;
  likes: User[];
}

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

  verified: boolean;
}

type props = {
  isGuest: boolean;
  currentUser: User | null;
  handleOpenProfile: (username: string) => void
};

export default function RightSideHome({ isGuest, currentUser, handleOpenProfile }: props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentTexts, setCommentTexts] = useState<{ [postId: string]: string }>({});
  const [loading, setLoading] = useState(true);


  useEffect(() => {    
    async function fetchPosts() {
      try {
        const res = await fetch("https://trenchsocial-backend.onrender.com/api/posts"); 
        if (!res.ok) throw new Error("Failed to fetch posts");

        const data = await res.json();
        setPosts(data);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const handlePost = async (name: string, username: string, imageURL:string, text: string, createdAt: Date, images?: string[]) => {
    const newPost: Post = { id: uuidv4(), name, username, imageURL, text, createdAt, likes: [], retruths: [], comments: [], images, verified: currentUser?.verified || false };

    try {
      const res = await fetch("https://trenchsocial-backend.onrender.com/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });
      if (!res.ok){
        toast.error("Failed to create post!", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          theme: "light",
        });
        
        return;
      }

      setPosts(prev => [newPost, ...prev]);
      
      toast.success("Post created successfully!", {
        type: "success",
        position: "top-center",
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: "light",
      });

    } catch (error) {
      console.error(error);
    };
  }

  const handleDeletePost = async (postId: string) => {
    if (isGuest) return;

    try {
      const res = await fetch(`https://trenchsocial-backend.onrender.com/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!res.ok){
        toast.error("Failed to delete post!", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          theme: "light",
        });

        return;
      }

      setPosts(prev => prev.filter(post => post.id !== postId));

      toast.success("Post deleted successfully!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: "light",
      });

    } catch (err) {
      console.error(err);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (isGuest) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const hasLiked = post.likes.some(u => u.id === currentUser!.id);

    try {
      const res = await fetch(`https://trenchsocial-backend.onrender.com/api/posts/${postId}/like`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser!.id, unlike: hasLiked })
      });

      if (!res.ok) throw new Error("Failed to update like");

      const updatedPost = await res.json();

      setPosts(prev =>
        prev.map(p => (p.id === postId ? { ...p, likes: updatedPost.likes } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleRetruthPost = async (postId: string) => {
    if (isGuest || !currentUser) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const hasRetruth = post.retruths.some(u => u.id === currentUser!.id);


    try {
      const res = await fetch(`https://trenchsocial-backend.onrender.com/api/posts/${postId}/retruth`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, unretruth: hasRetruth })
      });

      if (!res.ok) throw new Error("Failed to update retruth");

      const updatedPost = await res.json();

      setPosts(prev =>
        prev.map(p => (p.id === postId ? { ...p, retruths: updatedPost.retruths } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };


  const handleAddComment = async (postId: string) => {
    const newCommentText = commentTexts[postId]?.trim();
    if (!newCommentText || !currentUser) return;

    const newComment: Comment = {
      id: uuidv4(),
      name: currentUser.name,
      username: currentUser.username,
      imageURL: currentUser.imageURL,
      text: newCommentText,
      createdAt: new Date(),
      likes: []
    };

    try {
      const res = await fetch(`https://trenchsocial-backend.onrender.com/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComment),
      });

      if (!res.ok){
        toast.error("Failed to add comment!", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          theme: "light",
        });
        return;
      }

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, comments: [...post.comments, newComment] }
            : post
        )
      );

      setCommentTexts(prev => ({ ...prev, [postId]: "" }));

      toast.success("Comment added successfully!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: "light",
      });

    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (isGuest) return;

    try {
      const res = await fetch(`https://trenchsocial-backend.onrender.com/api/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!res.ok){
        toast.error("Failed to delete comment!", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          theme: "light",
        });
        return;
      }

      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.filter(comment => comment.id !== commentId),
              }
            : post
        )
      );

      toast.success("Comment deleted successfully!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: "light",
      });

    } catch (err) {
      console.error(err);
    }
  };

  const handleLikeComment = async (postId: string, commentId: string) => {
    if (isGuest) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const comment = post.comments.find(c => c.id === commentId);
    if (!comment) return;

    const alreadyLiked = comment.likes.some(u => u.id === currentUser!.id);

    try {
      const res = await fetch(`https://trenchsocial-backend.onrender.com/api/posts/${postId}/comments/${commentId}/like`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser!.id, unlike: alreadyLiked })
      });

      if (!res.ok) throw new Error("Failed to like/unlike comment");

      const updatedComment = await res.json();

      setPosts(prev =>
        prev.map(post => {
          if (post.id !== postId) return post;

          return {
            ...post,
            comments: post.comments.map(comment =>
              comment.id === commentId ? updatedComment : comment
            )
          };
        })
      );
    } catch (err) {
      console.error(err);
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

      

    <div className="right-side">  

      {/* {showProfile && profileUsername && (
        <Profile currentUser={currentUser} handleUpdate={() => {})}/>
      )} */}
    
      <span className="title">Home</span>

      {isGuest && (
        <div className="guest-message">
          As guest you don't have access to lots of features: post, like, comment, degen chat and private messages!
        </div>
      )}

      {!isGuest && (
        <div className="profile-and-post">
          <div style={{display: "flex", alignItems: "center", gap: 8}}>
            <img src={currentUser?.imageURL} alt="profile" className="profile-img" />
            <div style={{display: "flex", flexDirection: "column", backgroundColor:"transparent"}}>

              <span style={{backgroundColor:"transparent", display:"inline-flex", alignItems:"center", textDecoration:"none", gap:"0.15em"}} className="name namepost">
                {currentUser!.name}
                {currentUser!.verified && (
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

              <span style={{backgroundColor:"transparent"}} className="nametimestamp">@{currentUser!.username}</span>
            </div>
          </div>
            <PostInput onPost={handlePost} currentUser={currentUser}/>
        </div>
      )}

        {loading ? <span className="loading" style={{backgroundColor:"transparent"}}>Loading posts...</span> : 
            <div className="posts-feed">

                {posts.map((post) => (
                <div className="post-card" key={post.id}>
                  {!isGuest && post.username === currentUser?.username && (
                    <button className="delete-post-button" onClick={() => handleDeletePost(post.id)}>
                      <svg style={{backgroundColor:"transparent"}} stroke="currentColor" fill="white" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"></path></svg>
                    </button>
                  )}

                    <div className="post-header">
                      <img src={post.imageURL} alt="profile" className="profile-img" />
                    
                      {/* NAME + USERNAME + TIMESTAMP */}
                      <div className="post-meta">
                          <span style={{backgroundColor:"transparent", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:"0.15em"}} className="name" onClick={() => handleOpenProfile(post.username)}>
                            {post.name}
                            {post.verified && (
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

                          <span style={{backgroundColor:"transparent"}} className="nametimestamp">
                            @{post.username} · {(() => {
                              const date = new Date(post.createdAt);
                              const time = date.toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: false,
                              });
                              const day = date.toLocaleDateString(undefined, {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              });
                              return `${time} · ${day}`;
                            })()}
                          </span>
                      </div>  
                    </div>

                    <p className="post-text">{post.text}</p>
                    {post.images && post.images.length > 0 && (
                      <div className={`post-images ${getImageLayoutClass(post.images.length)}`}>
                        {post.images.map((img, i) => (
                          <div className="post-image-wrapper" key={i}>
                            <img src={img} alt={`post-img-${i}`} />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* LIKE RETWEET COMMENT + STATS */}
                    <div style={{ display: "flex",justifyContent: "space-between",alignItems: "center",paddingLeft: 8,paddingRight: 8}}>
                        <div style={{display: "flex",alignItems: "center",gap: 12, color: "#4B5563", fontSize: 14}}>
                            {/* LIKES */}
                            <button onClick={() => handleLikePost(post.id)}
                              disabled={isGuest} style={{display: "flex",alignItems: "center",gap: 6, padding: "6px 8px",borderRadius: 8,cursor: "pointer",color: "#4B5563",border: "none",}}
                              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F1F2F4")}
                              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                            >
                              <svg fill={post.likes.some(u => u.id === currentUser?.id) ? "red" : "none"} style={{backgroundColor: "transparent"}} width="24" height="24" viewBox="0 0 24 24" strokeLinecap="round" strokeWidth="2" strokeLinejoin="round" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" data-testid="svg-icon"><path d="M20.2328 6.4701L20.3952 6.76689C21.1597 8.35418 21.2151 10.1379 20.4969 12.0001C19.8211 13.7477 18.4642 15.4911 16.8514 16.9462C15.2519 18.3891 13.4816 19.4756 12.0396 19.9822C12.0257 19.9854 12.0153 19.9874 12.0078 19.9886C12.0025 19.9895 11.9992 19.9898 11.9978 19.99C11.9913 19.9899 11.986 19.9898 11.9818 19.9897C10.5425 19.492 8.76501 18.4026 7.15788 16.9505C5.54593 15.494 4.18855 13.7476 3.51269 11.9994L3.51157 11.9965C2.74033 10.0196 2.85032 8.13081 3.75666 6.47098C5.06362 4.09997 7.22019 3.72893 8.84915 4.14799C9.84987 4.40896 10.6764 4.94172 11.2355 5.60466L12 6.51106L12.7644 5.60466C13.3271 4.93741 14.1541 4.39928 15.1444 4.14962L15.1444 4.14963L15.1494 4.14835C16.7797 3.72842 18.9355 4.10012 20.2328 6.4701Z"></path></svg>
                              <span style={{ fontSize: 14, fontWeight: 500, backgroundColor:"transparent"}}>
                                {post.likes.some(u => u.id === currentUser?.id) ? "Unlike" : "Like"}
                              </span>
                            </button>

                            {/* RETWEET BUTTON */}
                            <button onClick={() => handleRetruthPost(post.id)}
                            disabled={isGuest} style={{display: "flex",alignItems: "center",gap: 6,padding: "6px 8px",borderRadius: 8,cursor: "pointer",color: "#4B5563",border: "none"}}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                            >
                            <svg fill={post.retruths.some(u => u.id === currentUser?.id) ? "#5548ef" : "none"} style={{backgroundColor:"transparent"}} width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" data-testid="svg-icon"><path d="M17.2793 3L20.5444 6.26506L17.2793 9.53011"></path><path d="M4.87305 11.1622V9.52971C4.87305 8.66376 5.21704 7.83328 5.82936 7.22096C6.44168 6.60864 7.27216 6.26465 8.1381 6.26465H19.5658"></path><path d="M7.16154 21.1639L3.89648 17.8988L7.16154 14.6338"></path><path d="M19.5658 13V14.6325C19.5658 15.4985 19.2218 16.329 18.6095 16.9413C17.9972 17.5536 17.1667 17.8976 16.3007 17.8976H4.87305"></path></svg>
                            <span style={{ fontSize: 14, fontWeight: 500, backgroundColor:"transparent" }}>
                              {post.retruths.some(u => u.id === currentUser?.id) ? "Unretruth" : "Retruth"}
                            </span>
                            </button>

                            {/* SHARE BUTTON DISABLED */}
                            <button disabled={true} 
                              //cursor: "pointer"
                              style={{display: "flex",alignItems: "center",gap: 6,padding: "6px 8px",borderRadius: 8,backgroundColor: "transparent",cursor: "not-allowed",transition: "background-color 0.2s",color: "#4B5563",border: "none",}}
                              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
                              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                              >
                              <svg style={{backgroundColor: "transparent"}} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-testid="svg-icon"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path><path d="M7 9l5 -5l5 5"></path><path d="M12 4l0 12"></path></svg>
                              <span style={{ fontSize: 14, fontWeight: 500, backgroundColor:"transparent" }}>Share</span>
                            </button>
                        </div>

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


                    {/* COMMENTS */}
                    {post.comments.length > 0 && (
                      <div className="comments-list" style={{ marginTop: "0.5rem", padding: "0 1rem" }}>
                        {post.comments.map((comment) => (
                          <div key={comment.id} style={{paddingTop:"1rem", borderTop: "1px solid rgba(0, 0, 0, 0.208)"}} className="comment-card">

                            {!isGuest && comment.username === currentUser?.username && (
                            <button className="delete-comment-button" onClick={() => handleDeleteComment(post.id, comment.id)}>
                              <svg style={{backgroundColor:"transparent"}} stroke="currentColor" fill="white" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"></path></svg>
                            </button>
                            )}
                          
                          
                          <div key={comment.id} style={{ display: "flex", alignItems: "flex-start", marginBottom: "1rem" }}>
                            {/* USER IMAGE */}
                            <img
                              src={comment.imageURL}
                              alt={comment.name}
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                marginRight: "0.75rem",
                              }}
                            />
                            {/* COMMENT BODY */}
                            <div style={{ flex: 1 }}>
                              <div style={{ backgroundColor: "#F9FAFB", borderRadius: "12px", padding: "0.5rem 1rem" }}>
                                <div style={{ backgroundColor:"transparent", fontWeight: "bold", fontSize: "0.85rem", color: "#111827" }}>
                                  {comment.name} <span style={{ backgroundColor:"transparent", fontWeight: 400, color: "#6B7280" }}>@{comment.username}</span>
                                </div>
                                <div style={{ backgroundColor:"transparent", fontSize: "0.875rem", color: "#374151", marginTop: "0.25rem" }}>
                                  {comment.text}
                                </div>
                                <div style={{ backgroundColor:"transparent", fontSize: "0.75rem", color: "#9CA3AF", marginTop: "0.25rem" }}>
                                  {(() => {
                                    const date = new Date(comment.createdAt);
                                    const time = date.toLocaleTimeString(undefined, {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                      hour12: false,
                                    });
                                    const day = date.toLocaleDateString(undefined, {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    });
                                    return `${time} · ${day}`;
                                  })()}
                                </div>

                                {/* COMMENT LIKE SECTION */}
                              <div style={{ backgroundColor:"transparent", display:"flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ backgroundColor:"transparent",display: "flex", alignItems: "center", gap: 12, color: "#4B5563" }}>
                                  <button
                                    disabled={isGuest}
                                    style={{display: "flex",alignItems: "center",gap: 6,padding: "6px 8px",borderRadius: 8,backgroundColor: "transparent",cursor: "pointer",transition: "background-color 0.2s",color: "#4B5563",border: "none"}}
                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                                    onClick={() => handleLikeComment(post.id, comment.id)}
                                  >
                                    <svg fill={comment.likes.some(u => u.id === currentUser?.id) ? "red" : "none"} style={{backgroundColor:"transparent"}} width="20" height="20" viewBox="0 0 24 24" strokeLinecap="round" strokeWidth="2" strokeLinejoin="round" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M20.2328 6.4701L20.3952 6.76689C21.1597 8.35418 21.2151 10.1379 20.4969 12.0001C19.8211 13.7477 18.4642 15.4911 16.8514 16.9462C15.2519 18.3891 13.4816 19.4756 12.0396 19.9822C12.0257 19.9854 12.0153 19.9874 12.0078 19.9886C12.0025 19.9895 11.9992 19.9898 11.9978 19.99C11.9913 19.9899 11.986 19.9898 11.9818 19.9897C10.5425 19.492 8.76501 18.4026 7.15788 16.9505C5.54593 15.494 4.18855 13.7476 3.51269 11.9994L3.51157 11.9965C2.74033 10.0196 2.85032 8.13081 3.75666 6.47098C5.06362 4.09997 7.22019 3.72893 8.84915 4.14799C9.84987 4.40896 10.6764 4.94172 11.2355 5.60466L12 6.51106L12.7644 5.60466C13.3271 4.93741 14.1541 4.39928 15.1444 4.14962L15.1444 4.14963L15.1494 4.14835C16.7797 3.72842 18.9355 4.10012 20.2328 6.4701Z" />
                                    </svg>
                                    <span style={{ fontSize: 14, fontWeight: 500 }}>{comment.likes.some(u => u.id === currentUser?.id) ? "Unlike" : "Like"}</span>
                                  </button>
                                </div>
                                <div style={{ backgroundColor:"transparent", fontSize: 12, color: "#6B7280" }}>
                                  {comment.likes.length}{comment.likes.length === 1 ? " like" : " likes"}
                                </div>
                                
                              </div>
                              </div>
                            </div>
                          </div>
                          </div>
                        ))}
                      </div>
                    )}



                    <form
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "0.5rem 0",
                            borderTop: "1px solid #E5E7EB",
                            width: "100%",
                        }}
                        onSubmit={e => {
                            e.preventDefault();
                            handleAddComment(post.id);
                        }}> 

                        {!isGuest && (
                        <>
                        <input
                            type="text"
                            placeholder="Write a comment..."
                            value={commentTexts[post.id] || ""}
                            style={{
                                color: "black",
                                flex: 1,
                                padding: "0.5rem",
                                borderRadius: "9999px", // rounded-full
                                border: "1px solid #E5E7EB", // gray-300
                                fontSize: "0.875rem", // text-sm
                                backgroundColor: "#F3F4F6", // bg-gray-100
                            }}
                            onChange={e =>
                                setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))
                            }
                        />
                        
                        <button
                            disabled={!commentTexts[post.id]?.trim()}
                            style={{
                                backgroundColor: '#5548EF',       
                                padding: '0.5rem',            
                                borderRadius: '9999px',       
                                fontWeight: 'bold',                
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '2rem',
                                height: '2rem', 
                                border: 'none',
                                cursor: !commentTexts[post.id]?.trim() ? 'not-allowed' : 'pointer',
                                opacity: !commentTexts[post.id]?.trim() ? 0.5 : 1,
                            }}>
                            <svg
                                stroke="currentColor"
                                fill="white"
                                style={{ backgroundColor: "transparent" }}
                                strokeWidth="0"
                                viewBox="0 0 448 512"
                                height="1em"
                                width="1em"
                                xmlns="http://www.w3.org/2000/svg"
                                >
                                <path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z" />
                            </svg>
                        </button>
                        </>
                        )}
                    </form>
                </div>

                
                ))}
            </div>
        }
        
    </div>
    </>
  );
}

function getImageLayoutClass(count: number) {
  if (count === 1) return "one";
  if (count === 2) return "two";
  return "three";
}
