import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { EditRaceMutation, DeleteRaceMutation, AddRaceMutation} from '../schema/schema';
import {createFragmentContainer, graphql, QueryRenderer} from 'react-relay';
import environment from './Components/Environment'
import Login from './Login/Login';
import User from './User/User';

export default class App extends React.Component {
  render() {
    return (
      <div>
        <QueryRenderer
          environment={environment}
          query={graphql`
          query AppQuery{
            user(id: 2) {
              id
              email
              username
              races(first: 1) {
                edges {
                  node {
                    date
                    type
                    time
                  }
                }
              }
            }
          }
          `}
          variables={{}}
          render={({error, props}) => {
            if (error) {
              return <div>Error!</div>;
            }
            if (!props) {
              return <div>Loading...</div>;
            }
            return (
            <div><h1>Hello {props.user.username}</h1>
            <p>id: {props.user.id}</p>
            <p>email: {props.user.email}</p>
            </div>
            );
          }}
        />
      </div>
    );
  }
}