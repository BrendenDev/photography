const GITHUB_API = 'https://api.github.com';
const OWNER = 'brendendev';
const REPO = 'photography';
const BRANCH = 'main';

export interface GitHubFile {
  path: string;
  sha: string;
  content?: string;
  size: number;
  type: 'file' | 'dir';
  name: string;
}

export interface PendingChange {
  path: string;
  content: string; // base64 for binary, utf-8 for text
  encoding: 'base64' | 'utf-8';
  action: 'create' | 'update' | 'delete';
  sha?: string; // required for update/delete
}

async function apiRequest(token: string, endpoint: string, options?: RequestInit) {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (options?.body) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${GITHUB_API}${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options?.headers || {}) },
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error(`GitHub API error: ${res.status} ${endpoint}`, errText);
    throw new Error(`GitHub API ${res.status}: ${errText}`);
  }
  return res.json();
}

export async function validateToken(token: string): Promise<string | null> {
  try {
    const data = await apiRequest(token, '/user');
    return data.login;
  } catch (e) {
    return null;
  }
}

export async function listDirectory(token: string, path: string): Promise<GitHubFile[]> {
  try {
    const data = await apiRequest(token, `/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`);
    return Array.isArray(data) ? data : [data];
  } catch (e) {
    return [];
  }
}

export async function readFile(token: string, path: string): Promise<{ content: string; sha: string }> {
  const data = await apiRequest(token, `/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`);
  if (data.type !== 'file') throw new Error(`Not a file: ${path}`);
  
  // Decode base64 content properly handling UTF-8
  const raw = atob(data.content.replace(/\n/g, ''));
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  const content = new TextDecoder().decode(bytes);
  return { content, sha: data.sha };
}

export async function readJsonFile<T>(token: string, path: string): Promise<{ data: T; sha: string }> {
  const { content, sha } = await readFile(token, path);
  return { data: JSON.parse(content) as T, sha };
}

export async function batchCommit(token: string, changes: PendingChange[], message: string): Promise<void> {
  if (changes.length === 0) return;
  await atomicCommit(token, changes, message);
}

async function atomicCommit(token: string, changes: PendingChange[], message: string): Promise<void> {
  // 1) Get current commit SHA
  const refData = await apiRequest(token, `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`);
  const currentCommitSha = refData.object.sha;

  // 2) Get base tree SHA
  const commitData = await apiRequest(token, `/repos/${OWNER}/${REPO}/git/commits/${currentCommitSha}`);
  const baseTreeSha = commitData.tree.sha;

  // 3) Create blobs and build tree items
  const treeItems: { path: string; mode: string; type: string; sha: string | null }[] = [];
  for (const change of changes) {
    if (change.action === 'delete') {
      treeItems.push({ path: change.path, mode: '100644', type: 'blob', sha: null });
      continue;
    }

    const blobData = await apiRequest(token, `/repos/${OWNER}/${REPO}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({
        content: change.encoding === 'base64' ? change.content : btoa(unescape(encodeURIComponent(change.content))),
        encoding: 'base64'
      })
    });

    treeItems.push({ path: change.path, mode: '100644', type: 'blob', sha: blobData.sha });
  }

  // 4) Create new tree
  const treeData = await apiRequest(token, `/repos/${OWNER}/${REPO}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems })
  });

  // 5) Create commit
  const newCommit = await apiRequest(token, `/repos/${OWNER}/${REPO}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message, tree: treeData.sha, parents: [currentCommitSha] })
  });

  // 6) Update ref
  await apiRequest(token, `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: newCommit.sha })
  });
}



export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
