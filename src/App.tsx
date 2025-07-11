import './App.css'

import { use, useEffect, useState } from 'react'

import LeftSide from './components/LeftSide'
import RightSideHome from './components/MainScreen'
import Chat from './components/Chat'
import LoginPopup from './components/Login'
import Livestreams from './components/Livestreams'
import Profile from './components/Profile'
import MessagesTab from './components/Messages';
import Leaderboard from './components/Leaderboard'


import { toast, ToastContainer, Slide } from "react-toastify";
import type { ToastOptions } from "react-toastify";
import { BadgeCheck, CircleAlert, Info, TriangleAlert } from 'lucide-react';
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

type Report = {
  type: string;
  message: string;
  name: string;
  username: string;
  email: string;
  createdAt: Date;
};

const commonOptions: ToastOptions = {
  position: "top-center",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: false,
  theme: "light",
};

export const toastSuccess = (message: string) => toast.success(message, commonOptions);
export const toastError = (message: string) => toast.error(message, commonOptions);


function App() {
  const [activeTab, setActiveTab] = useState('home')

  
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isGuest, setIsGuest] = useState(false)
  const [showPopup, setShowPopup] = useState(true)


  const [viewedProfileUser, setViewedProfileUser] = useState<User | null>(null);

const handleGuestJoin = () => {
  setShowPopup(false);
  setIsLoggedIn(true);
  setIsGuest(true);
};

/* useEffect(() => {
  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && activeTab === 'home') {
      setIsLoggedIn(true);
      setIsGuest(false);
      setShowPopup(false);

      const user_data = (JSON.parse(localStorage.getItem("user") || "{}"));

      const user = await getUser(user_data.id);

      setCurrentUser(user);

      toast.success("Welcome back @" + user!.username, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: "light",
      });
    }
  };

  fetchUser();
}, []); */

const handleRegister = async (email: string, password: string, name: string, username: string) => {
  try {
    const response = await fetch("http://localhost:4000/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, username }),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || data.error || "Login failed", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: "light",
      })
      return { success: false};
    }

    toast.success(data.message, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      theme: "light",
    });
    return { success: true};
    
  } catch (err) {
    toast.error("Something went wrong. Please try again.", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      theme: "light",
    });
    return { success: false};
  }
};


const handleUpdateProfile = async (updatedData: { name: string; email: string; imageFile?: File }) => {
  if (!currentUser) return;

  try {
    const currentEmail = currentUser.email;
    const name = updatedData.name;
    const email = updatedData.email;
    const imageFile = updatedData.imageFile;

    const formData = new FormData();
    formData.append("currentEmail", currentEmail);
    formData.append("name", name);
    formData.append("username", currentUser.username);
    formData.append("email", email);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const res = await fetch(`http://localhost:4000/api/users/${currentUser.id}`, {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || data.error || "Failed to update profile", {
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

    setCurrentUser(data);

    setTimeout(() => {
      toast.success("Profile updated successfully!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: "light",
      });
    }, 200);
    
  } catch (error) {
    setTimeout(() => {
      toast.error("Failed to update profile", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: "light",
      });
    }, 200);
  }
};

const getUser = async (userId: string): Promise<User | null> => {
  try {
    const res = await fetch(`http://localhost:4000/api/users/${userId}`);
    if (!res.ok) {
      throw new Error("Failed to fetch user");
    }
    const data = await res.json();

    return data as User;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

const handleOpenProfile = async (username: string) => {

  try {
    const res = await fetch(`http://localhost:4000/api/users/username/${username}`);

    if (!res.ok) {
      toast.error("Failed to load profile!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: "light",
      });
      
      return currentUser;
    }

    const userData = await res.json();

    setViewedProfileUser(userData);

    return userData;

  } catch (error) {
    console.error("Error fetching profile:", error);
    toast.error("Unexpected error loading profile.", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      theme: "light",
    });
  }
};


const handleLogin = async (email: string, password: string) => {
  
    try {
        const res = await fetch("http://localhost:4000/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || data.error || "Login failed", {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            theme: "light",
          });

          return { success: false };
        } 
        else {
          const temp_user = await getUser(data.user.id);
     
          const newUser = {
            id: data.user.id,
            name: temp_user!.name,
            username: temp_user!.username,
            email: temp_user!.email,
            imageURL: temp_user!.imageURL,
            createdAt: temp_user!.createdAt,
            followers: temp_user!.followers,
            following: temp_user!.following,
            verified: temp_user!.verified
          };

          setCurrentUser(newUser);

          toast.success("Welcome back @" + newUser.username, {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            theme: "light",
          });

          //localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          setIsLoggedIn(true);
          setIsGuest(false);
          setShowPopup(false);

          return { success: true};
        }
      } catch (err) {
        toast.error("Something went wrong. Please try again.", {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            theme: "light",
          });
        return { success: false}
      }
};

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setIsLoggedIn(false);
  setIsGuest(false);
  setCurrentUser(null);
  setActiveTab('home');
  setShowPopup(true);
}

const saveReport = async (type:string, message:string) => {
  let tempname = "";
  let tempusername = "";
  let tempemail = "";

  if (isGuest) {
    tempname = "Guest";
    tempusername = "guest";
    tempemail = "guest";
  }
  else{
    tempname = currentUser!.name;
    tempusername = currentUser!.username;
    tempemail = currentUser!.email;
  }
  const newReport: Report = { 
    type: type, 
    message: message,
    name: tempname,
    username: tempusername,
    email: tempemail,
    createdAt: new Date()
  };


  const res = await fetch("http://localhost:4000/api/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newReport),
  })

  const data = await res.json();

  if (!res.ok) {
    toast.error(data.message, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      theme: "light",
    });
  } else {
    toast.success("Report submitted successfully!", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      theme: "light",
    });
  }
  
}


const setViewedProfileNull = () => {
  setViewedProfileUser(null);
}

const renderRightComponent = () => {
  if (viewedProfileUser) {
    if(viewedProfileUser.username != currentUser?.username) {
      return (
        <Profile
          currentUser={(isGuest ? viewedProfileUser : currentUser)}
          profileUser={viewedProfileUser}
          handleUpdate={() => {}}
          isOtherUser
          isGuest={isGuest}
          onTabChange={setActiveTab}

          handleOpenProfile={handleOpenProfile}
        />
      );
    }
    else{
      return <Profile currentUser={currentUser} profileUser={null} handleUpdate={handleUpdateProfile} isOtherUser={false} isGuest={isGuest} onTabChange={setActiveTab} handleOpenProfile={handleOpenProfile}/>
    }
  }

  switch (activeTab) {
      case 'home':
        return <RightSideHome isGuest={isGuest} currentUser={currentUser} handleOpenProfile={handleOpenProfile} />
      case 'profile':
        return <Profile currentUser={currentUser} profileUser={null} handleUpdate={handleUpdateProfile} isOtherUser={false} isGuest={isGuest} handleOpenProfile={handleOpenProfile}/>
      case 'live':
        return <Livestreams />
      case 'leaderboard':
        return <Leaderboard handleOpenProfile={handleOpenProfile} changetoProfileTab={setActiveTab}/>
      case 'messages':
        return <MessagesTab currentUser={currentUser} onOpenProfile={handleOpenProfile} />
      default:
        return <RightSideHome isGuest={isGuest} currentUser={currentUser} />
  }
}

const LoggedInView = () => (
    <>
      <LeftSide currentUser={currentUser} onLogout={handleLogout} onTabChange={setActiveTab} isGuest={isGuest} saveReport={saveReport} selectedTab={activeTab} setViewedProfileNull={setViewedProfileNull} handleOpenProfile={handleOpenProfile} />
      {renderRightComponent()}
      {activeTab != 'messages' && (
        <Chat isGuest={isGuest} currentUser={currentUser} handleOpenProfile={handleOpenProfile} onTabChange={setActiveTab} onLogout={handleLogout}/>
      )}

    </>
)

const LoggedOutView = () => (
  <LoginPopup
    onLogin={handleLogin}
    onRegister={handleRegister}
    onGuestJoin={handleGuestJoin}
  />
)

  return (
    <>
      <ToastContainer
        aria-label="Notification Toasts"
        transition={Slide}
        icon={({ type }) => {
          switch (type) {
            case 'info': return <Info className="stroke-indigo-400" />
            case 'error': return <CircleAlert className="stroke-red-500" />
            case 'success': return <BadgeCheck className="stroke-green-500" />
            case 'warning': return <TriangleAlert className="stroke-yellow-500" />
            default: return null
          }
        }}
      />

    <div className="app" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        {isLoggedIn ? <LoggedInView /> : (showPopup && <LoggedOutView />)}
    </div>
      </>
  )
}

export default App
