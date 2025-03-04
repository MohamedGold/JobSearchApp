  import { GraphQLObjectType, GraphQLID, GraphQLString } from "graphql";
import { imageType } from "../../../utils/app.types.shared.js";

export const oneUserResponse = new GraphQLObjectType({
  name: "oneUserResponse",
  fields: {
    _id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    mobileNumber: { type: GraphQLString },
    profilePic: { type: imageType },
    coverPic: { type: imageType },
    role: { type: GraphQLString },
    isConfirmed: { type: GraphQLString }
  }
});

export const oneCompanyResponse = new GraphQLObjectType({
  name: "oneCompanyResponse",
  fields: {
    _id: { type: GraphQLID },
    companyName: { type: GraphQLString },
    description: { type: GraphQLString },
    industry: { type: GraphQLString },
    address: { type: GraphQLString },
    numberOfEmployees: { type: GraphQLString },
    companyEmail: { type: GraphQLString },
    logo: { type: imageType },
    coverPic: { type: imageType },
    approvedByAdmin: { type: GraphQLString }
  }
});
