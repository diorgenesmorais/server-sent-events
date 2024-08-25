import { Response } from "express";

type UserData = {
    connectionId: string;
    response: Response;
}

class Notifications {
    userConnections: Map<string, UserData[]>;

    constructor() {
        this.userConnections = new Map<string, UserData[]>();
    }

    get usersConnections() {
        return [...this.userConnections.keys()];
    }

    generateConnectionId() {
        return crypto.randomUUID();
    }

    registerConnectios(userId: string, response: Response) {
        if (!this.userConnections.has(userId)) {
            this.userConnections.set(userId, []);
        }

        const connectionId = this.generateConnectionId();
        this.userConnections
            .get(userId)
            ?.push({ connectionId, response });
        
        return connectionId;
    }

    removeConnection(userId: string, connectId: string) {
        if (!this.userConnections.has(userId)) {
            return;
        }

        const connects = this.userConnections
            .get(userId)
            ?.filter((a) => a.connectionId !== connectId);
        
        if (connects?.length) {
            this.userConnections.set(userId, connects);
        } else {
            this.userConnections.delete(userId);
        }
    }

    sendMessage(res: Response, userId: string, connectId: string, message: string) {
        const msg = JSON.stringify({
            userId,
            connectId,
            message
        });

        res.write(`data: ${msg}\n\n`);
    }

    sendMessageToSpecificClient(userId: string, message: string) {
        if (!this.userConnections.has(userId)) {
            return;
        }

        const connections = this.userConnections.get(userId);

        if (connections) {
            for (const connection of connections) {
                const { response, connectionId } = connection;
                this.sendMessage(response, userId, connectionId, message);
            }
        }
    }

    sendMessageToEveryone(message: string) {
        for (const userId of this.usersConnections) {
            this.sendMessageToSpecificClient(userId, message);
        }
    }
}

export default Notifications;
