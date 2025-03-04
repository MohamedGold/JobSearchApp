import { GraphQLObjectType, GraphQLSchema, GraphQLList, GraphQLID, GraphQLString } from "graphql";
import { oneUserResponse, oneCompanyResponse } from "./types/admin.types.js";
import { User } from "../../DB/Models/User.model.js";
import * as dbService from "../../DB/db.service.js";
import { Company } from "../../DB/Models/Company.model.js";
import { banUser, unbanUser, banCompany, unbanCompany, approveCompany } from "./admin.mutation.js";




const AdminQuery = new GraphQLObjectType({
  name: "AdminQuery",
  fields: {
    users: {
      type: new GraphQLList(oneUserResponse),
      resolve: async () => {
        const users = await dbService.find({ model: User });
        return users;
      }
    },
    companies: {
      type: new GraphQLList(oneCompanyResponse),
      resolve: async () => {
        const companies = await dbService.find({ model: Company });
        return companies;
      }
    }
  }
});


const AdminMutation = new GraphQLObjectType({
  name: "AdminMutation",
  fields: {
    banUser,
    unbanUser,
    banCompany,
    unbanCompany,
    approveCompany
  }
});
export const schema = new GraphQLSchema({
  query: AdminQuery,
  mutation: AdminMutation
});
