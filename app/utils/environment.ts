import process from "process";
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
