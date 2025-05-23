import process from "process";
import { isProduction } from "@/utils/environment";

export function getApiDomain(): string {
  const prodUrl = process.env.NEXT_PUBLIC_PROD_API_URL ||
    "https://delta-entity-453619-p5.oa.r.appspot.com";
  const devUrl = "http://localhost:8080";
  return isProduction() ? prodUrl : devUrl;
}
