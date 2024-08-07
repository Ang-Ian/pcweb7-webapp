import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Button, Image, Dropdown } from 'react-bootstrap';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, storage } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import './HomePage.css';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const [user, loading] = useAuthState(auth);
    const [image, setImage] = useState("https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png")
    const [username, setUsername] = useState("User");
    const navigate = useNavigate();
    
    async function setProfileIcons() {
        console.log(user);
        // const postDocument = await getDoc(doc(db, "users", "tmSGh0QBSiPnFftDRR1Mt5QdfF13"));
        if (user) {
            const postDocument = await getDoc(doc(db, "users", user.uid));
            const userInfo = postDocument.data();
            console.log(userInfo);
            setImage(userInfo.image);
            setUsername(userInfo.username);
        }
    }

    useEffect(() => {
        if (loading) return;
        // if (!user) navigate("/login");
        setProfileIcons();
      }, [user, loading, navigate]);
    

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div>
            <Navbar bg="light" expand="lg" className="navbar">
                <Container className="navbar-container">
                    <Navbar.Brand href="/">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Patates.jpg/1024px-Patates.jpg"
                            alt="Logo"
                            className="logo"
                        />
                    </Navbar.Brand>
                    <div className="navbar-center">
                        {user && (
                            <div className="navbar-text">
                                Welcome, {username}
                            </div>
                        )}
                    </div>
                    <Nav className="ms-auto">
                        {user ? (
                            <Dropdown align="end" className="profile-dropdown">
                                <Dropdown.Toggle
                                    variant="link"
                                    id="dropdown-profile"
                                    className="profile-pic-dropdown"
                                >
                                    <Image
                                        src={image}
                                        roundedCircle
                                        className="profile-pic"
                                        alt="Profile"
                                        style={{ width: '40px', height: '40px' }}
                                    />
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="profile-dropdown-menu">
                                    <Dropdown.Item onClick={handleLogout()}>Log Out</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <Button variant="outline-primary" href="/login">Log In</Button>
                        )}
                    </Nav>
                </Container>
            </Navbar>
            {/* Add your main content here */}
            <Container className="main-content">
                <h1>Home Page</h1>
                {/* Additional content goes here */}
            </Container>
        </div>
    );
};

export default HomePage;
