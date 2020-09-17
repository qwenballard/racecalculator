import React, { Component, useState } from "react";
import { Redirect } from "react-router-dom";
// import  { useState } from 'react-hook-form';
import axios from 'axios';

function Login(props) {
    const [state, setState] = useState({
      username: "",
      password: "",
    })
    const [id, setID] = useState(null);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setState(prevState => ({
        ...prevState,
        [name]: value
      }))
    }

    const handleSubmit = (e) => {
      e.preventDefault();
      console.log(state);

      axios.post('/login', {
        username: state.username,
        password: state.password
      })
      .then((res) => {
        console.log(res);
        setID(res.data);
      })
      .catch((err) => console.log(err));

      setState({
        username: "",
        password: ""
      });

      if(id){
       props.history.push("/user");
      }
    }

    return (
      <div>
        <form>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={state.username}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={state.password}
          onChange={handleChange}
         />

        <input type='submit' class-name='submit-button' onClick={(e) => {handleSubmit(e)}} />
        </form>
      </div>
    );
}

export default Login;

/* sent back user id to state
 if user id state is a number,
  render the profile component (user jsx)
else we want to show the login.  */