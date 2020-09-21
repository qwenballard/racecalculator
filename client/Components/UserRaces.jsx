import React from 'react';
import environment from '../Environment'
import {createFragmentContainer, graphql, QueryRenderer} from 'react-relay';

const UserRaces = (props) => {
  const {userID} = props;
  console.log(userID)
  return (
    <QueryRenderer
    environment={environment}
    query={graphql`
    query UserRacesQuery($userID: Int!) {
      user(id: $userID) {
        email
        username
        id
        races {
          edges {
            node {
              date
              type
              time
              id
            }
          }
        }
      }
    }
    `}
    variables={{userID}}
    render={({error, props}) => {
      console.log(props)
      if (error) {
        return <div>Error!</div>;
      }
      if (!props) {
        return <div>Loading...</div>;
      }

      return (
      <div>
        <h1>User ID: {props.user.username}</h1>
          <div>{props.user.races.edges.map(item => <div key={item.node.id}>{item.node.date} {item.node.type} {item.node.time}</div>)}</div>
      </div>
      );
    }}
  />
  )
}
export default UserRaces;