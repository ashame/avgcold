import { Message } from 'discord.js';
import Handler from './Handler';
import { verbose as log, error } from 'npmlog';

class DesuRatHandler extends Handler {
    handler = async (msg: Message) => {
        if (msg.partial)
            try {
                await msg.fetch();
            } catch {
                error('desu-rat-handler', 'failed to fetch message');
                return;
            }
        if (msg.author.id == '712532570486865931') {
            log('desu-rat-handler', `desu msg received: ${msg.content}`);
            msg.react('🐀').catch(() => {
                error('desu-rat-handler', 'failed to react to message');
            })
        }
    }

    register = (): boolean => {
        if (this.registered) return false;
        this.bot.client.on('message', this.handler);
        return (this.registered = true);
    }

    deregister = (): boolean => {
        if (!this.registered) return false;
        this.bot.client.off('message', this.handler);
        return (this.registered = false) == false;
    }
}

export default DesuRatHandler;