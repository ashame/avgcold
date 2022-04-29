import Handler from './Handler';

class DesuRatHandler extends Handler {
    register(): boolean {
        if (this.handler != null) return false;
        this.handler = async (msg) => {
            if (msg.partial) await msg.fetch();
            if (msg.author.id == '712532570486865931') {
                console.log(`desu msg received: ${msg.content}`);
                msg.react('🐀');
            }
        }
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