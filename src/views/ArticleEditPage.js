// copied from AddArticlePage.js

import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Form, Image, Dropdown } from 'react-bootstrap';
import { signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, storage } from "../firebase";
import { doc, addDoc, collection, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes, deleteObject } from "firebase/storage";
import { useNavigate, useParams } from 'react-router-dom';
import './HomePage.css';
import ArticleDetails from './ArticleDetailsPage';

const EditArticle = () => {
    const [user, loading] = useAuthState(auth);
    const [error, setError] = useState("");
    const [title, setTitle] = useState(""); //
    const [username, setUsername] = useState("");
    const [image, setImage] = useState("https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png")
    const [previewImage, setPreviewImage] = useState("https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png")
    const [thumbnail, setThumbnail] = useState(null); //
    const [body, setBody] = useState(""); //
    const [imageUrl, setImageUrl] = useState("");
    const params = useParams();
    const id = params.id;
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

    async function deletePost(id) {
        {/* something suspicious is brewing in the code below. i don't knwo why but the compiler is crying about imageName being unfound :() */}
        // const articleDocument = await getDoc(doc(db, "article", id));
        // const article = articleDocument.data();
        // console.log(article);
        // const desertRef = ref(storage, `thumbnails/${article.imageName}`);
        // deleteObject(desertRef).then(() => {
        //     console.log("deleted from firebase storage")
        // }).catch((error) => {
        //     console.log("OH NO")
        //     console.error(error.message)
        // });
        console.log("deleting...")
        await deleteDoc(doc(db, "articles", id));
        console.log("deleted!")
        navigate("/");
    }

    async function updateArticle() {
        const thumbnailReference = ref(storage, `thumbnails/${thumbnail.name}`);
        const response = await uploadBytes(thumbnailReference, thumbnail);
        const imageUrl = await getDownloadURL(response.ref);
        await updateDoc(doc(db, "articles", id), {body, thumbnail: imageUrl, title})
    }

    async function getArticle(id) {
        const articleDocument = await getDoc(doc(db, "articles", id));
        const article = articleDocument.data();
        setTitle(article.title);
        // setThumbnail(article.thumbnail);
        setBody(article.body);
        setPreviewImage(article.thumbnail);
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
            getArticle(id);
    }, [id]);

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
                <h1>Edit Article</h1>
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
                    <Image
                    src={previewImage}
                    style={{
                        objectFit: "cover",
                        width: "10rem",
                        height: "10rem"
                    }}
                    />
                    <Form.Group className="mb-3" controlId="formThumbnail">
                        <Form.Label>Thumbnail</Form.Label>
                        <Form.Control
                            type="file"
                            onChange={(e) => {
                                const imageFile = e.target.files[0];
                                const previewImage = URL.createObjectURL(imageFile);
                                setThumbnail(imageFile);
                                setPreviewImage(previewImage);
                            }}
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
                    <Button variant="primary mx-3" type="submit" onClick={(e) => {
                        setError("");
                        const canSubmit = title && thumbnail && body;
                        if (canSubmit) {
                            try {
                                updateArticle();
                                navigate("/");
                            } catch (error) {
                                setError(error.message);
                                }
                        }
                    }}>
                        Submit
                    </Button>
                    <Button variant="danger mx-3" type="button"
                        onClick={() => deletePost(id)}
                        style={{ cursor: "pointer" }}    
                    >
                        Delete
                    </Button>
                </Form>
            </Container>
        </div>
    );
};

export default EditArticle;