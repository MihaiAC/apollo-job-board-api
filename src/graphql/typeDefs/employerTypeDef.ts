export const employerTypeDef = `
  type Employer {
    id: Int!
    name: String!
    contactEmail: String!
    industry: String!
  }

  type Query {
    employers: [Employer!]!
    employer(id: Int!): Employer
  }

  type Mutation {
    addEmployer(name: String!, contactEmail: String!, industry: String): Employer!
    updateEmployer(id: Int!, name: String, contactEmail: String, industry: String): Employer!
    deleteEmployer(id: Int!): Employer!
  }
`;
