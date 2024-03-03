export default class Reptoid {
    
    constructor({ accessToken }) {
        this.creds = {
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
        this.github = new GithubManager({ accountId, creds: this.creds })
        this._workspaces = new WorkspacesManager({ accountId, creds: this.creds })
    }

    workspaces = () => this._workspaces

    workspace = (workspaceId) => {
        return new WorkspaceManager({ accountId: this.accountId, workspaceId })
    }
}

class GithubManager {

    constructor({ creds }) {
        this.creds = creds
    }
    
    getRepositories = async () => {
        return [
            'viperfish',
            'code-generator-sample',
        ]
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
    }

    all = async () => {
        return fetch(`http://localhost:3010/api/v1/accounts/${this.accountId}/workspaces`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.creds.accessToken}`,
                }
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
        return fetch(`http://localhost:3010/api/v1/accounts/${this.accountId}/workspaces`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.creds.accessToken}`,
                },
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