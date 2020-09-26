import graphql from "graphql";
const { GraphQLObjectType, GraphQLString } = graphql;

const UserType = new GraphQLObjectType({
    name: "User",
    description: "User Type",

    fields: () => ({
        username: {
            type: GraphQLString,
        },
        email: {
            type: GraphQLString,
        },
        password: {
            type: GraphQLString,
        },
    }),
});

export default UserType;
