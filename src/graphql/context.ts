import type DataLoader from "dataloader";
import type { Employer, Job, Application, User } from "../../prisma/generated";
import { JwtPayload } from "jsonwebtoken";

export interface Context {
  loaders: {
    employerById: DataLoader<number, Employer | null>;
    jobsByEmployer: DataLoader<number, Job[]>;
    userById: DataLoader<number, User | null>;
    applicationsByUser: DataLoader<number, Application[]>;
    applicationsByJob: DataLoader<number, Application[]>;
    employerByManagerId: DataLoader<number, Employer | null>;
    jobById: DataLoader<number, Job | null>;
  };
  auth: JwtPayload | null;
}
