import express, { Request, Response } from 'express';
import Notifications from './notifications';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());
const notification = new Notifications()

app.get('/', (_, res: Response) => {
    res.writeHead(200, {
        'content-language': 'text/html',
    });

    const pathIndex = path.join(__dirname, '../public', 'index.html');
    const streamIndexHtml = fs.createReadStream(pathIndex);
    streamIndexHtml.pipe(res);
})

app.get('/events', (req: Request, res: Response) => {
    res.writeHead(200, {
        'cache-control': 'no-cache',
        'Content-Type': 'text/event-stream',
        connection: 'keep-alive'
    })
    .write('\n');

    const { userId } = req.query;
    if (!userId) {
        res.json({error: 'userId missing in query'});
        return;
    }

    const connectId = notification.registerConnectios(userId.toString(), res);

    req.on('close', () => {
        notification.removeConnection(userId.toString(), connectId);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    
});

// ******************************************************
// * O código abaixo simula a geração de notificações.
// * Em um sistema real, essas notificações seriam
// * enviadas por meio de mensagens de serviços como
// * Kafka, Azure Queue/Service Bus, RabbitMQ, etc.
// ******************************************************
const CINCO_SEGUNDOS_EM_MS = 5_000;

// Envia uma mensagem para todos usuários conectados a
// cada 5 segundos
setInterval(() => {
    notification.sendMessageToEveryone(
        `Olá: ${Date.now()}`
    );
}, CINCO_SEGUNDOS_EM_MS);

// Envia uma mensagem para um usuário aleatório a cada 5
// segundos
setInterval(() => {
    const { usersConnections } = notification;
    const indiceAleatorio = Math.floor(
        Math.random() * usersConnections.length
    );
    const idUsuario = usersConnections[indiceAleatorio];

    notification.sendMessageToSpecificClient(
        idUsuario,
        `Mensagem exclusiva do usuário: ${Date.now()}`
    );
}, CINCO_SEGUNDOS_EM_MS);