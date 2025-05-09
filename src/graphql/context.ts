import type DataLoader from "dataloader";
import type { Employer, Job } from "@prisma/client";

export interface Context {
  loaders: {
    employerById: DataLoader<number, Employer | undefined>;
    jobsByEmployer: DataLoader<number, Job[]>;
  };
}
