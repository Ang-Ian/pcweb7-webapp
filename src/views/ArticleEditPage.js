// copied from AddArticlePage.js

import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Form, Image, Dropdown } from 'react-bootstrap';
import { signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, storage } from "../firebase";
import { doc, addDoc, collection, setDoc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const EditArticle = () => {
    const [user, loading] = useAuthState(auth);
    const [error, setError] = useState("");
    const [title, setTitle] = useState("");
    const [username, setUsername] = useState("");
    const [image, setImage] = useState("https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png")
    const [thumbnail, setThumbnail] = useState(null);
    const [body, setBody] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const navigate = useNavigate();

    async function setProfileIcons() {
        if (user) {
            const postDocument = await getDoc(doc(db, "users", user.uid));
            const userInfo = postDocument.data();
            try {
                setImage(userInfo.image);
                setUsername(userInfo.username);
            } catch (error) {
                console.log(error.message);
            }
        }
    }

    async function addArticleDetails(id) {
        const thumbnailReference = ref(storage, `thumbnails/${thumbnail.name}`);
        const response = await uploadBytes(thumbnailReference, thumbnail);
        const thumbnailUrl = await getDownloadURL(response.ref);
        await addDoc(collection(db, "articles"), {
            title,
            body,
            thumbnail: thumbnailUrl,
            uid: user.uid
        });
    }

    useEffect(() => {
        setPersistence(auth, browserLocalPersistence)
            .then(() => {
                // Existing and future Auth states will persist until explicitly signed out
                return auth.currentUser;
            })
            .catch((error) => {
                console.error("Error setting persistence:", error);
            });
    }, []);

    useEffect(() => {
        if (loading) return;
        if (!user) navigate("/login");
        setProfileIcons();
    }, [user, loading, navigate]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
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
                        {user && (
                            <>
                                <Button
                                    variant="outline-primary"
                                    className="write-button"
                                    onClick={() => navigate('/add-article')}
                                >
                                    Write
                                </Button>
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
                                        <Dropdown.Item
                                            onClick={() => {handleLogout()}}
                                        >
                                            Log Out
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </>
                        )}
                        {!user && (
                            <Button variant="outline-primary" href="/login">Log In</Button>
                        )}
                    </Nav>
                </Container>
            </Navbar>
            <Container className="main-content">
                <h1>Add New Article</h1>
                <Form>
                    <Form.Group className="mb-3" controlId="formArticleTitle">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter title"
                            value={title}
                            onChange={(e) => {setTitle(e.target.value)}}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formThumbnail">
                        <Form.Label>Thumbnail</Form.Label>
                        <Form.Control
                            type="file"
                            onChange={(e) => {setThumbnail(e.target.files[0])}}
                        />
                        {imageUrl && (
                            <Image src={imageUrl} thumbnail style={{ marginTop: '10px', maxWidth: '200px' }} />
                        )}
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formArticleBody">
                        <Form.Label>Body</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            placeholder="Enter body text"
                            value={body}
                            onChange={(e) => {setBody(e.target.value)}}
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" onClick={(e) => {
                        setError("");
                        const canSubmit = title && thumbnail && body;
                        if (canSubmit) {
                            try {
                                addArticleDetails(user.uid);
                                navigate("/");
                            } catch (error) {
                                setError(error.message);
                                }
                        }
                    }}>
                        Submit
                    </Button>
                </Form>
            </Container>
        </div>
    );
};

export default EditArticle;