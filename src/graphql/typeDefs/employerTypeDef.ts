export const typeDefs = `
  type Employer {
    id: Int!
    name: String!
    contact_email: String!
    industry: String!
  }

  type Query {
    employers: [Employer!]!
    employer(id: Int!): Employer
  }
`;
