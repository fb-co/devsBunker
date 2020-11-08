import ApolloServer from "apollo-server-express";
const { gql } = ApolloServer;

export default gql`
    type UserAccountAction {
        message: String!
        accessToken: String
    }

    type FetchableUser {
        username: String!
        email: String!
        desc: String!
        tag: String!
        followers: [String]!
        following: [String]!
        profile_pic: String!
    }

    type LogoutResponse {
        message: String!
    }

    # What the user updated
    type mutatedUserDetails {
        field: String!
        newValue: String!
    }

    type UpdateDetailsResponse {
        changedData: [mutatedUserDetails] # nullable array of updated user data
        message: String
    }

    input UpdateUserPayload {
        field: String!
        newValue: String!
    }

    type Query {
        user(username: String!): FetchableUser

        loginUser(
            username: String
            email: String
            password: String!
        ): UserAccountAction!

        logoutUser: LogoutResponse!
    }

    type Mutation {
        signupUser(
            username: String!
            email: String!
            password: String!
        ): UserAccountAction!

        revokeUserSession(token: String!): Boolean!

        updateUserDetails(
            token: String!
            fields: [UpdateUserPayload!]!
        ): UpdateDetailsResponse!

        followPerson(
            token: String!
            person: String!
        ): FetchableUser
    }
`;
