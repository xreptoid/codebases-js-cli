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
        return new UserManager({ accountId, creds: this.creds })
    }
}

class UserManager {
    
    constructor({ accountId, creds }) {
        this.accountId = accountId
        this.creds = creds
        this._github = new GithubManager({ accountId, creds: this.creds })
        this._workspaces = new WorkspacesManager({ accountId, creds: this.creds })
    }

    github = () => this._github
    workspaces = () => this._workspaces

    workspace = (workspaceId) => {
        return new WorkspaceManager({ accountId: this.accountId, workspaceId })
    }
}

class GithubManager {

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

    clone = async (path) => {
        if (false) {
            return {
                result: 'error',
                reason: 'no-access'
            }
        }
        return {
            workspaceId: '1233333',
            status: 'CLONING'
        }
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

    create = async () => {
        return fetch(this.baseUrl, {
            method: 'POST',
            headers: getBaseHeaders(this.creds.accessToken),
            body: JSON.stringify({})
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
    }

    remove = () => {
        return {
            workspaceId: '123',
        }
    }

    putFile = async (workspaceId, filePath, content) => {
        return {
            result: 'ok'
        }
    }

    readFile = async (workspaceId, filePath) => {
        return {
            result: 'ok',
            content: 'fgsdfsdfsdf'
        }
    }
    
    removeFile = async (workspaceId, filePath) => {
        return {
            result: 'ok'
        }
    }
}