const getBaseUrl = apiHost => `${apiHost}/api/v1`

const getBaseHeaders = accessToken => {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
    }
}

export default class Reptoid {
    
    constructor({ apiHost, accessToken }) {
        this.creds = {
            apiHost: apiHost || 'https://api.codebases.reptoid.com',
            accessToken,
        }
    }

    account = (accountId) => {
        return new AccountManager({ accountId, creds: this.creds })
    }

    github = () => {
        return new GithubManager({ creds: this.creds })
    }
}

class GithubManager {

    constructor({ creds }) {
        this.creds = creds
        this.baseUrl = `${getBaseUrl(this.creds.apiHost)}/github`
    }

    authByCode = async code => {
        return fetch(`${this.baseUrl}/auth-by-code`, {
            method: 'POST',
            headers: getBaseHeaders(this.creds.accessToken),
            body: JSON.stringify({ code }),
        }).then(resp => resp.json())
            .then(({ result, data, reason }) => {
                if (result === 'ok') {
                    return data
                }
                throw Error('Error:' + reason)
            })
    }
    
    getAccessTokenByCode = async code => {
        return fetch(`${this.baseUrl}/github`, {
            method: 'POST',
            headers: getBaseHeaders(this.creds.accessToken),
            body: JSON.stringify({ code }),
        }).then(resp => resp.json())
            .then(({ result, data, reason }) => {
                if (result === 'ok') {
                    return data.accessToken
                }
                throw Error('Error:' + reason)
            })
    }
}

class AccountManager {
    
    constructor({ accountId, creds }) {
        this.accountId = accountId
        this.creds = creds
        this._github = new AccountGithubManager({ accountId, creds: this.creds })
        this._workspaces = new WorkspacesManager({ accountId, creds: this.creds })
    }

    github = () => this._github
    workspaces = () => this._workspaces

    workspace = (workspaceId) => {
        return new WorkspaceManager({ accountId: this.accountId, workspaceId, creds: this.creds })
    }
}

class AccountGithubManager {

    constructor({ accountId, creds }) {
        this.accountId = accountId
        this.creds = creds
        this.baseUrl = `${getBaseUrl(this.creds.apiHost)}/accounts/${this.accountId}/github`
    }
    
    repos = async () => {
        return fetch(`${this.baseUrl}/repos`, {
            method: 'GET',
            headers: getBaseHeaders(this.creds.accessToken),
        })
        .then(resp => resp.json())
        .then(({ result, reason, data }) => {
            if (result === 'ok') {
                return data.repos || []
            }
            throw Error('Error:' + reason)
        })
    }

    connect = async ({ githubAccessToken }) => {
        // for manual accounts adding
        return {
            result: 'ok'
        }
    }

    clone = async (repoPath) => {
        return fetch(`${this.baseUrl}/clone`, {
            method: 'POST',
            headers: getBaseHeaders(this.creds.accessToken),
            body: JSON.stringify({
                repoPath
            })
        })
        .then(resp => resp.json())
        .then(({ result, reason, body }) => {
            return
        })
    }
}

class WorkspacesManager {
    
    constructor({ accountId, creds }) {
        this.accountId = accountId
        this.creds = creds
        this.baseUrl = `${getBaseUrl(this.creds.apiHost)}/accounts/${this.accountId}/workspaces`
    }

    all = async () => {
        return fetch(this.baseUrl, {
            method: 'GET',
            headers: getBaseHeaders(this.creds.accessToken),
        })
        .then(resp => resp.json())
        .then(({ result, reason, data }) => {
            if (result === 'ok') {
                return data.workspaces || []
            }
            throw Error('Error:' + reason)
        })
    }

    create = async ({ meta }) => {
        return fetch(this.baseUrl, {
            method: 'POST',
            headers: getBaseHeaders(this.creds.accessToken),
            body: JSON.stringify({
                meta: meta || {}
            })
        })
        .then(resp => resp.json())
        .then(({ result, reason, data }) => {
            if (result === 'ok') {
                return data
            }
            throw Error('Error:' + reason)
        })
    }

}

class WorkspaceManager {
    
    constructor({ accountId, workspaceId, creds }) {
        this.accountId = accountId
        this.workspaceId = workspaceId
        this.creds = creds
        this.baseUrl = `${getBaseUrl(this.creds.apiHost)}/accounts/${this.accountId}/workspaces/${workspaceId}`
        this._git = new GitManager({ accountId, workspaceId, creds })
    }

    file = (filePath) => {
        return new FileManager({ accountId: this.accountId, workspaceId: this.workspaceId, filePath, creds: this.creds })
    }

    git = () => this._git

    get = async () => {
        return fetch(this.baseUrl, {
            method: 'GET',
            headers: getBaseHeaders(this.creds.accessToken),
        }).then(resp => resp.json())
        .then(({ result, reason, data }) => {
            if (result === 'ok') {
                return data
            }
            throw Error('Error:' + reason)
        })
    }

    remove = async () => {
        return fetch(this.baseUrl, {
            method: 'DELETE',
            headers: getBaseHeaders(this.creds.accessToken),
        })
        .then(resp => resp.json())
        .then(({ result, reason, data }) => {
            if (result === 'ok') {
                return 
            }
            throw Error('Error:' + reason)
        })
    }
}

class FileManager {
    constructor({ accountId, workspaceId, filePath, creds }) {
        this.accountId = accountId
        this.workspaceId = workspaceId
        this.filePath = filePath 
        this.creds = creds
        this.baseUrl = `${getBaseUrl(this.creds.apiHost)}/accounts/${this.accountId}/workspaces/${this.workspaceId}/files`
    }

    read = async () => {
        return fetch(this.baseUrl + `?filePath=${encodeURIComponent(this.filePath)}`, {
            method: 'GET',
            headers: getBaseHeaders(this.creds.accessToken),
        })
        .then(resp => resp.json())
        .then(({ result, reason, data }) => {
            if (result === 'ok') {
                return data
            }
            throw Error('Error:' + reason)
        })
    }

    write = async (content) => {
        return fetch(this.baseUrl, {
            method: 'POST',
            headers: getBaseHeaders(this.creds.accessToken),
            body: JSON.stringify({
                filePath: this.filePath,
                content,
            })
        })
        .then(resp => resp.json())
        .then(({ result, reason, data }) => {
            if (result === 'ok') {
                return 
            }
            throw Error('Error:' + reason)
        })
    }

    createFolder = async () => {
        return fetch(`${getBaseUrl(this.creds.apiHost)}/accounts/${this.accountId}/workspaces/${this.workspaceId}/folder`, {
            method: 'POST',
            headers: getBaseHeaders(this.creds.accessToken),
            body: JSON.stringify({
                filePath: this.filePath,
            })
        })
        .then(resp => resp.json())
        .then(({ result, reason, data }) => {
            if (result === 'ok') {
                return 
            }
            throw Error('Error:' + reason)
        })
    }
}

class GitManager {
    constructor({ accountId, workspaceId, creds }) {
        this.accountId = accountId
        this.workspaceId = workspaceId
        this.creds = creds
        this.baseUrl = `${getBaseUrl(this.creds.apiHost)}/accounts/${this.accountId}/workspaces/${this.workspaceId}/git`
    }

    status = async () => {
        return fetch(this.baseUrl + '/status', {
            method: 'GET',
            headers: getBaseHeaders(this.creds.accessToken),
        })
        .then(resp => resp.json())
        .then(({ result, reason, data }) => {
            if (result === 'ok') {
                return data
            }
            throw Error('Error:' + reason)
        })
    }

    diff = async () => {
        return fetch(this.baseUrl + '/diff', {
            method: 'GET',
            headers: getBaseHeaders(this.creds.accessToken),
        })
        .then(resp => resp.json())
        .then(({ result, reason, data }) => {
            if (result === 'ok') {
                return data
            }
            throw Error('Error:' + reason)
        })
    }

    init = async () => {
        return fetch(this.baseUrl + '/init', {
            method: 'POST',
            headers: getBaseHeaders(this.creds.accessToken),
        })
        .then(resp => resp.json())
        .then(({ result, reason, data }) => {
            if (result === 'ok') {
                return data
            }
            throw Error('Error:' + reason)
        })
    }

    push = async () => {
        return fetch(this.baseUrl + '/push', {
            method: 'POST',
            headers: getBaseHeaders(this.creds.accessToken),
        })
        .then(resp => resp.json())
        .then(({ result, reason, data }) => {
            if (result === 'ok') {
                return data
            }
            throw Error('Error:' + reason)
        })
    }

    setOrigin = async (url) => {
        return fetch(this.baseUrl + '/set-origin', {
            method: 'POST',
            headers: getBaseHeaders(this.creds.accessToken),
            body: JSON.stringify({
                url
            })
        })
        .then(resp => resp.json())
        .then(({ result, reason, data }) => {
            if (result === 'ok') {
                return data
            }
            throw Error('Error:' + reason)
        })
    }
}