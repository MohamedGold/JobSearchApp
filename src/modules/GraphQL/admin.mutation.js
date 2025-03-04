import { GraphQLNonNull, GraphQLID } from "graphql";
import { oneUserResponse, oneCompanyResponse } from "./types/admin.types.js";
import * as dbService from "../../DB/db.service.js";
import { User } from "../../DB/Models/User.model.js";
import { Company } from "../../DB/Models/Company.model.js";

export const banUser = {
  type: oneUserResponse,
  args: {
    userId: { type: new GraphQLNonNull(GraphQLID) }
  },
  resolve: async (parent, args) => {
    const updatedUser = await dbService.findOneAndUpdate({
      model: User,
      filter: { _id: args.userId },
      data: { bannedAt: new Date() },
      option: { new: true }
    });
    return updatedUser;
  }
};

export const unbanUser = {
  type: oneUserResponse,
  args: {
    userId: { type: new GraphQLNonNull(GraphQLID) }
  },
  resolve: async (parent, args) => {
    const updatedUser = await dbService.findOneAndUpdate({
      model: User,
      filter: { _id: args.userId },
      data: { $unset: { bannedAt: 0 } },
      option: { new: true }
    });
    return updatedUser;
  }
};

export const banCompany = {
  type: oneCompanyResponse,
  args: {
    companyId: { type: new GraphQLNonNull(GraphQLID) }
  },
  resolve: async (parent, args) => {
    const updatedCompany = await dbService.findOneAndUpdate({
      model: Company,
      filter: { _id: args.companyId },
      data: { bannedAt: new Date() },
      option: { new: true }
    });
    return updatedCompany;
  }
};

export const unbanCompany = {
  type: oneCompanyResponse,
  args: {
    companyId: { type: new GraphQLNonNull(GraphQLID) }
  },
  resolve: async (parent, args) => {
    const updatedCompany = await dbService.findOneAndUpdate({
      model: Company,
      filter: { _id: args.companyId },
      data: { $unset: { bannedAt: 0 } },
      option: { new: true }
    });
    return updatedCompany;
  }
};

export const approveCompany = {
  type: oneCompanyResponse,
  args: {
    companyId: { type: new GraphQLNonNull(GraphQLID) }
  },
  resolve: async (parent, args) => {
    const updatedCompany = await dbService.findOneAndUpdate({
      model: Company,
      filter: { _id: args.companyId },
      data: { approvedByAdmin: true },
      option: { new: true }
    });
    return updatedCompany;
  }
};
