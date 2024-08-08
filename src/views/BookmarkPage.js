import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Button, Card, Image, Dropdown, Row } from 'react-bootstrap';
import { signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, getDocs, collection, addDoc, } from "firebase/firestore";
import './HomePage.css';
import { Link, useNavigate, useParams } from 'react-router-dom';

const BookmarkPage = () => {
    const [user, loading] = useAuthState(auth);
    const [image, setImage] = useState("https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png");
    const [username, setUsername] = useState("User");
    const [articles, setArticles] = useState([]);
    const params = useParams();
    const userid = params.id;
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

    async function getBookmarkedArticles() {
        const query = await getDocs(collection(db, "bookmarks"));
        const bookmarks = query.docs.map((doc) => {
          return { id: doc.id, ...doc.data() };
        });
        console.log("userid: ", userid);
        const bookmarkedArticles = bookmarks.filter((doc) => (userid === doc.userid));
        console.log("soihoasihn", bookmarkedArticles);
        setArticles(bookmarkedArticles);
    }
    
    const ArticleRow = () => {
        console.log("articles: ", articles);
        // return articles.map((article, index) => <ArticleCard key={index} article={article} />);
        if (articles.length === 0) { return }
        return articles.map((article, index) => {
            console.log('more code here....')
        return <ArticleCard key={index} article={article} />
        });
    };
    
    useEffect(() => {
        if (loading) return;
        if (!user) navigate("/login");
        setProfileIcons();
        getBookmarkedArticles();
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
                                        <Dropdown.Item
                                            onClick={() => navigate(`bookmarks/${user.uid}`)}
                                        >
                                            Bookmarks
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
                <h1>Bookmarks</h1>
                <Row style={{alignItems: "center"}}>
                    <ArticleRow />
                </Row>
            </Container>
        </div>
    );
};

export default BookmarkPage;


function ArticleCard({ article }) {
    const [authorusername, setAuthorUsername] = useState("");
    const [authorpfp, setauthorPfP] = useState(null);
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();

    const { thumbnail, id } = article;
    // console.log("pdff", article.thumbnail, "blehg", article.uid)
    console.log("poodlies", article)
    const userid = article.uid;
    async function getAuthorProfile() {
        console.log("hello: ",userid)
        const authorDocument = await getDoc(doc(db, "users", userid));
        const author = authorDocument.data();
        setAuthorUsername(author.username);
        setauthorPfP(author.image);
    };
    getAuthorProfile();

    return (
      <Link
        onClick={() => navigate(`article/${id}`)}
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
            <p>{article.articleid}</p>
          {/* <p style={{fontSize:"15px",textAlign:"left"}}>
                Written by: 
                <Link
                    to={`user/${article.uid}`}
                    style={{ cursor: "pointer", textDecoration:"None" }}
                >
                    <Image
                    src={authorpfp}
                    roundedCircle
                    className="profile-pic" 
                    style={{ width: '40px', height: '40px' }}
                                /> {authorusername}
                </Link>
                </p>
            <Link onClick={() => addToBookmarks(id)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bookmarks" viewBox="0 0 16 16">
                <path d="M2 4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v11.5a.5.5 0 0 1-.777.416L7 13.101l-4.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v10.566l3.723-2.482a.5.5 0 0 1 .554 0L11 14.566V4a1 1 0 0 0-1-1z"/>
                <path d="M4.268 1H12a1 1 0 0 1 1 1v11.768l.223.148A.5.5 0 0 0 14 13.5V2a2 2 0 0 0-2-2H6a2 2 0 0 0-1.732 1"/>
            </svg>
            </Link> */}
          </Card.Text>
        </Card.Body>
        </Card>
      </Link>
    );
  }