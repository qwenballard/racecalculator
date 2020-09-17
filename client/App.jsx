import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import Login from './Login/Login';
import User from './User/User';

function App(){
    return (
      <Router>
        <div>
          <nav>
            <ul>
              <li>
                <Link to="/">Login</Link>
              </li>
              <li>
                <Link to="/user">User</Link>
              </li>
            </ul>
          </nav>

          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Switch>
            <Route exact path="/user" render={(props) => <User { ...props } />}></Route>
            <Route exact path="/" render={(props) => <Login { ...props } /> }></Route>
          </Switch>
        </div>
      </Router>
    );
};

export default App;