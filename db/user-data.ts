import { hashSync } from "bcrypt-ts-edge";

export const sampleUsers = [
  {
    name: "IT Admin",
    email: "admin@mail.com",
    password: hashSync("123456", 10),
    role: "admin",
  },
  {
    name: "Student",
    email: "user@mail.com",
    password: hashSync("123456", 10),
    role: "user",
  },
];
