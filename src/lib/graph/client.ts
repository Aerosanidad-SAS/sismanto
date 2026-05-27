// Microsoft Graph API client — app-only (client credentials flow)
// Handles OneDrive file operations and webhook subscriptions.

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
// OneDrive subscriptions expire after at most 4230 minutes (~2.9 days)
const SUBSCRIPTION_TTL_MS = 4200 * 60 * 1000;

// ── Auth ──────────────────────────────────────────────────────────────────────

interface TokenCache {
  token: string;
  expiresAt: number;
}

let _tokenCache: TokenCache | null = null;

export async function getAccessToken(): Promise<string> {
  if (_tokenCache && Date.now() < _tokenCache.expiresAt - 60_000) {
    return _tokenCache.token;
  }

  const tenantId     = process.env.AZURE_TENANT_ID!;
  const clientId     = process.env.AZURE_CLIENT_ID!;
  const clientSecret = process.env.AZURE_CLIENT_SECRET!;

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method:  "POST",
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

async function graphFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  return fetch(`${GRAPH_BASE}${path}`, {
    ...options,
    headers: {
      Authorization:  `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
}

// ── Folder path resolution ────────────────────────────────────────────────────
// Graph supports UPN (email) directly in /users/{upn}/drive paths.
// Folder paths are resolved once and cached for the lifetime of the process.

const _folderIdCache = new Map<string, string>();

export async function resolveFolderPath(folderPath: string): Promise<string> {
  if (_folderIdCache.has(folderPath)) {
    return _folderIdCache.get(folderPath)!;
  }

  const user = process.env.ONEDRIVE_USER!;
  // Encode each segment individually so '/' separators are preserved for Graph's root: path syntax
  const encodedPath = folderPath.split("/").map(encodeURIComponent).join("/");
  const res = await graphFetch(`/users/${user}/drive/root:/${encodedPath}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cannot resolve OneDrive path "${folderPath}" (${res.status}): ${text}`);
  }

  const json = await res.json();
  const id: string = json.id;
  if (!id) {
    throw new Error(`Cannot resolve OneDrive path "${folderPath}": Graph response missing 'id' field`);
  }
  _folderIdCache.set(folderPath, id);
  return id;
}

export async function getInputFolderId(): Promise<string> {
  const path = process.env.ONEDRIVE_INPUT_FOLDER!;
  return resolveFolderPath(path);
}

export async function getReviewFolderId(): Promise<string> {
  const path = process.env.ONEDRIVE_REVIEW_FOLDER!;
  return resolveFolderPath(path);
}

// ── File listing ──────────────────────────────────────────────────────────────

export interface OneDriveFile {
  id:       string;
  name:     string;
  size:     number;
  mimeType: string;
  webUrl:   string;
}

const PDF_AND_IMAGE_MIMES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function listFolderFiles(folderId: string): Promise<OneDriveFile[]> {
  const user = process.env.ONEDRIVE_USER!;
  const res  = await graphFetch(
    `/users/${user}/drive/items/${folderId}/children` +
    `?$select=id,name,size,file,webUrl&$top=100`
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to list folder ${folderId} (${res.status}): ${text}`);
  }

  const json = await res.json();
  const items: Array<{
    id: string;
    name: string;
    size: number;
    webUrl: string;
    file?: { mimeType: string };
  }> = json.value ?? [];

  return items
    .filter((item) => item.file && PDF_AND_IMAGE_MIMES.has(item.file.mimeType))
    .map((item) => ({
      id:       item.id,
      name:     item.name,
      size:     item.size,
      mimeType: item.file!.mimeType,
      webUrl:   item.webUrl,
    }));
}

// ── File operations ───────────────────────────────────────────────────────────

export async function downloadFile(itemId: string): Promise<Buffer> {
  const user = process.env.ONEDRIVE_USER!;
  const res  = await graphFetch(
    `/users/${user}/drive/items/${itemId}/content`,
    { redirect: "follow" }
  );
  if (!res.ok) {
    throw new Error(`Failed to download OneDrive item ${itemId}: ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function moveAndRenameFile(
  itemId:        string,
  targetFolderId: string,
  newName:       string
): Promise<void> {
  const user = process.env.ONEDRIVE_USER!;
  const res  = await graphFetch(`/users/${user}/drive/items/${itemId}`, {
    method: "PATCH",
    body:   JSON.stringify({
      name:            newName,
      parentReference: { id: targetFolderId },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to move/rename item ${itemId}: ${res.status} ${text}`);
  }
}

export async function renameFile(itemId: string, newName: string): Promise<void> {
  const user = process.env.ONEDRIVE_USER!;
  const res  = await graphFetch(`/users/${user}/drive/items/${itemId}`, {
    method: "PATCH",
    body:   JSON.stringify({ name: newName }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to rename item ${itemId}: ${res.status} ${text}`);
  }
}

// ── Webhook subscriptions ─────────────────────────────────────────────────────

export async function registerWebhookSubscription(
  notificationUrl: string
): Promise<{ id: string; expirationDateTime: string }> {
  const user             = process.env.ONEDRIVE_USER!;
  const folderId         = await getInputFolderId();
  const secret           = process.env.GRAPH_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("GRAPH_WEBHOOK_SECRET is not configured — cannot register webhook subscription");
  }
  const expirationDateTime = new Date(Date.now() + SUBSCRIPTION_TTL_MS).toISOString();

  const res = await graphFetch("/subscriptions", {
    method: "POST",
    body:   JSON.stringify({
      changeType:          "created",
      notificationUrl,
      resource:            `/users/${user}/drive/items/${folderId}/children`,
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

export async function renewWebhookSubscription(subscriptionId: string): Promise<string> {
  const expirationDateTime = new Date(Date.now() + SUBSCRIPTION_TTL_MS).toISOString();

  const res = await graphFetch(`/subscriptions/${subscriptionId}`, {
    method: "PATCH",
    body:   JSON.stringify({ expirationDateTime }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to renew subscription ${subscriptionId}: ${res.status} ${text}`);
  }

  const json = await res.json();
  return json.expirationDateTime;
}
