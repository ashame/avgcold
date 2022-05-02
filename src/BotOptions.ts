interface BotOptions {
    [key: string]: unknown;
};

export const defaults: BotOptions = Object.freeze({
    desuId: '712532570486865931',
});

export default BotOptions;