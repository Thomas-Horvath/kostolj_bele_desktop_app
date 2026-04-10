function normalizeConfiguredUrl(value) {
  const normalized = value?.trim();

  if (!normalized) {
    return "";
  }

  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
}

export function getConfiguredAppUrl() {
  return normalizeConfiguredUrl(process.env.NEXTAUTH_URL || process.env.APP_URL || "");
}

export function getRequestOrigin(req) {
  const configuredUrl = getConfiguredAppUrl();
  const headers = req?.headers;

  if (!headers?.get) {
    return configuredUrl;
  }

  const forwardedProto = headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || headers.get("host")?.trim();

  if (forwardedProto && host) {
    return `${forwardedProto}://${host}`;
  }

  if (host) {
    const isLocalHost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
    return `${isLocalHost ? "http" : "https"}://${host}`;
  }

  return configuredUrl;
}

export function isSecureRequest(req) {
  const requestOrigin = getRequestOrigin(req);
  return Boolean(requestOrigin && requestOrigin.startsWith("https://"));
}
