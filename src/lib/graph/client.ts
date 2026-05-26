// Microsoft Graph API client — app-only (client credentials flow)
// Handles OneDrive file operations and webhook subscriptions.

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
// OneDrive subscriptions expire after at most 4230 minutes (~2.9 days)
const SUBSCRIPTION_TTL_MS = 4200 * 60 * 1000;

interface TokenCache {
  token: string;
  expiresAt: number;
}

let _tokenCache: TokenCache | null = null;

export async function getAccessToken(): Promise<string> {
  if (_tokenCache && Date.now() < _tokenCache.expiresAt - 60_000) {
    return _tokenCache.token;
  }

  const tenantId  = process.env.AZURE_TENANT_ID!;
  const clientId  = process.env.AZURE_CLIENT_ID!;
  const clientSecret = process.env.AZURE_CLIENT_SECRET!;

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type:    "client_credentials",
        client_id:     clientId,
        client_secret: clientSecret,
        scope:         "https://graph.microsoft.com/.default",
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph token request failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  _tokenCache = {
    token:     json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return _tokenCache.token;
}

async function graphFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAccessToken();
  return fetch(`${GRAPH_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
}

export async function downloadFile(itemId: string): Promise<Buffer> {
  const userId = process.env.ONEDRIVE_USER_ID!;
  const res = await graphFetch(
    `/users/${userId}/drive/items/${itemId}/content`,
    // Follow redirect to the actual download URL
    { redirect: "follow" }
  );
  if (!res.ok) {
    throw new Error(`Failed to download OneDrive item ${itemId}: ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function moveAndRenameFile(
  itemId: string,
  targetFolderId: string,
  newName: string
): Promise<void> {
  const userId = process.env.ONEDRIVE_USER_ID!;
  const res = await graphFetch(
    `/users/${userId}/drive/items/${itemId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        name: newName,
        parentReference: { id: targetFolderId },
      }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to move/rename item ${itemId}: ${res.status} ${text}`);
  }
}

export async function renameFile(itemId: string, newName: string): Promise<void> {
  const userId = process.env.ONEDRIVE_USER_ID!;
  const res = await graphFetch(
    `/users/${userId}/drive/items/${itemId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ name: newName }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to rename item ${itemId}: ${res.status} ${text}`);
  }
}

export async function registerWebhookSubscription(
  notificationUrl: string
): Promise<{ id: string; expirationDateTime: string }> {
  const userId  = process.env.ONEDRIVE_USER_ID!;
  const folderId = process.env.ONEDRIVE_INPUT_FOLDER_ID!;
  const secret  = process.env.GRAPH_WEBHOOK_SECRET!;

  const expirationDateTime = new Date(Date.now() + SUBSCRIPTION_TTL_MS).toISOString();

  const res = await graphFetch("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      changeType:          "created",
      notificationUrl,
      resource:            `/users/${userId}/drive/items/${folderId}/children`,
      expirationDateTime,
      clientState:         secret,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to register webhook: ${res.status} ${text}`);
  }

  const json = await res.json();
  return { id: json.id, expirationDateTime: json.expirationDateTime };
}

export async function renewWebhookSubscription(
  subscriptionId: string
): Promise<string> {
  const expirationDateTime = new Date(Date.now() + SUBSCRIPTION_TTL_MS).toISOString();

  const res = await graphFetch(`/subscriptions/${subscriptionId}`, {
    method: "PATCH",
    body: JSON.stringify({ expirationDateTime }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to renew subscription ${subscriptionId}: ${res.status} ${text}`);
  }

  const json = await res.json();
  return json.expirationDateTime;
}
