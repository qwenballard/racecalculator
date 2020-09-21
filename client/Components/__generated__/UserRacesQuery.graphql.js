/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type UserRacesQueryVariables = {|
  userID: number
|};
export type UserRacesQueryResponse = {|
  +user: ?{|
    +email: ?string,
    +username: ?string,
    +id: string,
    +races: ?{|
      +edges: ?$ReadOnlyArray<?{|
        +node: ?{|
          +date: ?string,
          +type: ?string,
          +time: ?string,
          +id: string,
        |}
      |}>
    |},
  |}
|};
export type UserRacesQuery = {|
  variables: UserRacesQueryVariables,
  response: UserRacesQueryResponse,
|};
*/


/*
query UserRacesQuery(
  $userID: Int!
) {
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
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "userID"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "userID"
      }
    ],
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "user",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "email",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "username",
        "storageKey": null
      },
      (v1/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "RaceConnection",
        "kind": "LinkedField",
        "name": "races",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "RaceEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Race",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "date",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "type",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "time",
                    "storageKey": null
                  },
                  (v1/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "UserRacesQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UserRacesQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "53913cd0b7244339e70f6d9dd57ea9ed",
    "id": null,
    "metadata": {},
    "name": "UserRacesQuery",
    "operationKind": "query",
    "text": "query UserRacesQuery(\n  $userID: Int!\n) {\n  user(id: $userID) {\n    email\n    username\n    id\n    races {\n      edges {\n        node {\n          date\n          type\n          time\n          id\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = 'c081b965145dc84e080d6ed84e200729';

module.exports = node;
