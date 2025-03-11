import { BaseCodec } from 'multiformats';
import { split, combine } from 'shamir-secret-sharing';

const loadPackage = async (base: string): Promise<BaseCodec> => {
    try {
        const module = await import(`multiformats/bases/${base}`);
        return module[base];
    } catch (error) {
        const module = await import(`multiformats/bases/base64`);
        return module.base64;
    }
};

export const stringToShards64 = async (
    origin: string,
    shares: number,
    threshold: number,
    base = 'base64',
): Promise<string[]> => {
    const baseCodec = await loadPackage(base);
    const secret = new TextEncoder().encode(origin);
    const shards = await split(secret, shares, threshold);
    return shards.map((shard) => baseCodec.encoder.baseEncode(shard));
};

export const shards64ToString = async (shardBases: string[], base = 'base64'): Promise<string> => {
    const baseModule = await loadPackage(base);
    const shards = shardBases.map((shard) => baseModule.decoder.baseDecode(shard));
    const secret = await combine(shards);
    return new TextDecoder().decode(secret);
};

export const test = async () => {
    const origin = JSON.stringify({ key: 'value' });
    const shares = 5;
    const threshold = 3;
    const base = 'base58btc';
    console.log('origin:', origin);
    const shards = await stringToShards64(origin, shares, threshold, base);
    console.log('shards:', shards);
    const partialShards = shards.sort(() => 0.5 - Math.random()).slice(0, threshold);
    console.log('partial shards:', partialShards);

    const restored = await shards64ToString(partialShards, base);
    console.log('Restored with partial shards:', restored);
};

test();
