import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { setDoc, doc, addDoc, collection } from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import "./SignUpPage.css"

export default function SignUpPage() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [image, setImage] = useState("");
    const [previewImage, setPreviewImage] = useState("https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function addUserDetails(id) {
        const imageReference = ref(storage, `profilePictures/${image.name}`);
        // console.log("image name:", image.name);
        const response = await uploadBytes(imageReference, image);
        // console.log("response:", response);
        const imageUrl = await getDownloadURL(response.ref);
        // await addDoc(collection(db, "users"), {id, username, image: imageUrl});
        // await db.collection('users').doc(id).set({
        //     username,
        //     image: imageUrl
        // })
        await setDoc(doc(db, "users", id), {
            username,
            image: imageUrl
          });
    }

  return (
    <Container className="signup-wrapper">
      <h1 className="my-3">Sign up for an account</h1>
      <Form>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Form.Text className="text-muted">
            We'll never share your email with anyone else.
          </Form.Text>
        </Form.Group>
        
        <Form.Group className="mb-3" controlId="formBasicText">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="username"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="image">
            <Form.Label>Image</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => {
                const imageFile = e.target.files[0];
                const previewImage = URL.createObjectURL(imageFile);
                setImage(imageFile);
                setPreviewImage(previewImage);
              }}
            />
            <Form.Text className="text-muted">
              Make sure the url has a image type at the end: jpg, jpeg, png.
            </Form.Text>
          </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <a href="/login" className="text-muted">Have an existing account?</a>
        </Form.Group>
        <Button variant="primary"
        onClick={async (e) => {
            setError("");
            const canSignup = email && password;
            if (canSignup) {
                try {
                    const response = await createUserWithEmailAndPassword(auth, email, password);
                    const id = response.user.uid;
                    addUserDetails(id);
                    navigate("/");
                }
                catch (error) {
                setError(error.message);
                }
            }
        }}
        >Sign Up</Button>
      </Form>
      <p>{error}</p>
    </Container>
  );
}