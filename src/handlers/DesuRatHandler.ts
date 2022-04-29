import { Message } from 'discord.js';
import Handler from './Handler';
import { error } from 'npmlog';

class DesuRatHandler extends Handler {
    handler = async (msg: Message) => {
        if (msg.partial) await msg.fetch();
        if (msg.author.id == '712532570486865931') {
            console.log(`desu msg received: ${msg.content}`);
            msg.react('🐀').catch(() => {
                error('desu-rat-handler', 'failed to react to message');
            })
        }
    }

    register(): boolean {
        if (this.handler != null) return false;
        this.bot.client.on('message', this.handler);
        return true;
    }

    deregister(): boolean {
        if (this.handler == null) return false;
        this.bot.client.off('message', this.handler);
        return true;
    }
}

export default DesuRatHandler;