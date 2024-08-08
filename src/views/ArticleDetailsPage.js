import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Form, Row, Card, Col, Image, Dropdown } from 'react-bootstrap';
import { signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, storage } from "../firebase";
import { doc, addDoc, collection, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes, deleteObject } from "firebase/storage";
import { useNavigate, useParams } from 'react-router-dom';
import './HomePage.css';

const ArticleDetails = () => {
    const [user, loading] = useAuthState(auth);
    const [error, setError] = useState("");
    const [title, setTitle] = useState("");
    const [username, setUsername] = useState("");
    const [image, setImage] = useState("https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png")
    const [author, setAuthor] = useState("");
    const [authorpfp, setAuthorPfP] = useState("");
    const [authorid, setAuthorID] = useState("");
    const [thumbnail, setThumbnail] = useState(null);
    const [body, setBody] = useState("");
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

    async function getArticle(id) {
        const articleDocument = await getDoc(doc(db, "articles", id));
        const article = articleDocument.data();
        setTitle(article.title);
        setThumbnail(article.thumbnail);
        setBody(article.body);
        const userid = article.uid;
        setAuthorID(userid);
        const authorDocument = await getDoc(doc(db, "users", userid));
        const author = authorDocument.data();
        setAuthor(author.username);
        setAuthorPfP(author.image);
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
            getArticle(id)
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
            <Row style={{ marginTop: "2rem" }}>
            {/* <Row> */}
                <Image src={thumbnail} className="mx-auto" style={{width: '100%'}}/>
            {/* </Row> */}
            {/* <Col> */}
                <p style={{fontSize:"25px",textAlign:"left"}}>
                Written by: <Image
                src={authorpfp}
                roundedCircle
                className="profile-pic" 
                style={{ width: '50px', height: '50px' }}
                            /> {author}
                </p>
                {(user.uid === authorid) &&
                    <Button
                variant="outline-primary" 
                className="edit-button"
                onClick={() => navigate(`/edit-article/${id}`)}
                >Edit
                </Button>
                }
                <Card style={{width: '100%',marginTop:"10px"}}>
                <Card.Body >
                    <Card.Text style={{fontSize:"30px",fontWeight:"bold",textAlign:"left"}}>{title}</Card.Text>
                    <Card.Text style={{textAlign: "left"}}>{body}</Card.Text>
                    {/* <Card.Link href={`/update/${id}`}>Edit</Card.Link>
                    <Card.Link
                    onClick={() => deletePost(id)}
                    style={{ cursor: "pointer" }}
                    >
                    Delete
                    </Card.Link> */}
                </Card.Body>
                </Card>
            {/* </Col> */}
            </Row>
            </Container>
        </div>
    );
};

export default ArticleDetails;