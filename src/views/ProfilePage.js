import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Button, Card, Image, Dropdown, Row } from 'react-bootstrap';
import { signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import './HomePage.css';
import { Link, useNavigate, useParams } from 'react-router-dom';

const ProfilePage = () => {
    const [user, loading] = useAuthState(auth);
    const [image, setImage] = useState("https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png");
    const [username, setUsername] = useState("User");
    const [authorusername, setAuthorUsername] = useState("");
    const [articles, setArticles] = useState([]);
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

    async function getAuthorsArticles() {
        const query = await getDocs(collection(db, "articles"));
        console.log(query);
        console.log("HALLOO", query.docs[0].data());
        const articles = query.docs.map((doc) => {
            return { id: doc.id, ...doc.data() };
        })
        const authorsArticles = articles.filter((doc) => (doc.uid === id));
        console.log("boomz", authorsArticles);
        setArticles(authorsArticles);
    }

    const ArticleRow = () => {
    return articles.map((article, index) => <ArticleCard key={index} article={article} />);
    };

    async function getAuthorProfile() {
        const authorDocument = await getDoc(doc(db, "users", id));
        const author = authorDocument.data();
        setAuthorUsername(author.username);
    };
    
    useEffect(() => {
        setPersistence(auth, browserLocalPersistence)
            .then(() => {
                // Existing and future Auth states will persist until explicitly signed out
                return auth.currentUser;
            })
            .catch((error) => {
                console.error("Error setting persistence:", error);
            });
        getAuthorsArticles();
        getAuthorProfile();
    }, []);

    useEffect(() => {
        if (loading) return;
        if (!user) navigate("/login");
        setProfileIcons();
    }, [user, loading, navigate]);
    
    async function handleLogout() {
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
                                            onClick={() => handleLogout()}
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
                <h1>{authorusername}'s articles</h1>
                <Row style={{alignItems: "center"}}>
                    <ArticleRow />
                </Row>
            </Container>
        </div>
    );
};

export default ProfilePage;


function ArticleCard({ article }) {
    const [authorusername, setAuthorUsername] = useState("");
    const [authorpfp, setauthorPfP] = useState(null);

    const { thumbnail, id } = article;
    // console.log("pdff", article.thumbnail, "blehg", article.uid)
    console.log("poodlies", article)
    const userid = article.uid;
    async function getAuthorProfile() {
        const authorDocument = await getDoc(doc(db, "users", userid));
        const author = authorDocument.data();
        setAuthorUsername(author.username);
        setauthorPfP(author.image);
    };
    getAuthorProfile();
    return (
        <Link
        to={`article/${id}`}
        style={{
          width: "18rem",
          marginLeft: "1rem",
          marginTop: "2rem",
          textDecoration: "None"
        }}
      >
        <Card style={{ width: '18rem', height:"25rem" }}>
        <Card.Img variant="top" src={thumbnail} key={id} height="200px" />
        <Card.Body>
          <Card.Title style={{fontSize:"25px", textAlign:"left"}}>{article.title}</Card.Title>
          <Card.Text>
          <p style={{fontSize:"15px",textAlign:"left"}}>
                Written by: 
                    <Image
                    src={authorpfp}
                    roundedCircle
                    className="profile-pic" 
                    style={{ width: '40px', height: '40px' }}
                                /> {authorusername}
                </p>
          </Card.Text>
        </Card.Body>
        </Card>
      </Link>
    );
  }