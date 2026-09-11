import config from "../site.config.json";
export const site = config;
export const asset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
export const legalUrl = (page: string) => asset(`${page}/`);
