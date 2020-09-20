import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { EditRaceMutation, DeleteRaceMutation, AddRaceMutation} from '../schema/schema';
import {createFragmentContainer, graphql, QueryRenderer} from 'react-relay';
import UserRaces from './Components/UserRaces'
import Login from './Login/Login';
import User from './User/User';

export default class App extends React.Component {
  render() {
    const testID = 2;
    return (
      <div>
        <UserRaces userID={testID}/>
      </div>
    );
  }
}