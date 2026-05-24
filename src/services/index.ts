/**
 * Public service surface. UI code should import from here, never reach into
 * `mock/`. Swapping to a real backend is one file per service.
 */
export { campaignsService } from "./campaigns.service";
export { assetsService } from "./assets.service";
export { aiService } from "./ai.service";
export { schedulerService } from "./scheduler.service";
export { brandKitService } from "./brand-kit.service";
export { userService } from "./user.service";

export type { CampaignsService } from "./campaigns.service";
export type { AssetsService, AssetsListFilter } from "./assets.service";
export type { AIService, AIServiceSubscriber } from "./ai.service";
export type { SchedulerService, SchedulerListFilter } from "./scheduler.service";
export type { BrandKitService } from "./brand-kit.service";
export type { UserService } from "./user.service";
