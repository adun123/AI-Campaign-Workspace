import type { User, Workspace } from "@/types";
import { delay, jitter } from "@/lib/delay";
import { clone, getDB } from "./mock/db";

export interface UserService {
  me(): Promise<User>;
  myWorkspace(): Promise<Workspace>;
}

export const userService: UserService = {
  async me() {
    await delay(jitter(80, 200));
    return clone(getDB().user);
  },
  async myWorkspace() {
    await delay(jitter(80, 200));
    return clone(getDB().workspace);
  },
};
