import { split, combine } from 'shamir-secret-sharing';
import { base64 } from 'multiformats/bases/base64';
import { base58btc } from 'multiformats/bases/base58';
import pako from 'pako';

export type SupportedBase = 'base58' | 'base64';
const loadPackage = async (base: SupportedBase) => {
    // base == base256emoji, base64, base32, base16, base58btc
    switch (base) {
        case 'base58':
            return base58btc;
        case 'base64':
            return base64;
        default:
            throw new Error('Unsupported base');
    }
};

export class ShamirSharing {
    stringToShards64 = async (
        origin: string,
        shares: number,
        threshold: number,
        base: SupportedBase = 'base64',
    ): Promise<string[]> => {
        const baseCodec = await loadPackage(base);
        const compressed = pako.deflate(origin);

        const shards = await split(compressed, shares, threshold);
        return shards.map((shard) => baseCodec.encode(shard));
    };

    shards64ToString = async (shardBases: string[], base: SupportedBase = 'base64'): Promise<string> => {
        const baseModule = await loadPackage(base);
        const shards = shardBases.map((shard) => baseModule.decode(shard));
        const secret = await combine(shards);
        return pako.inflate(secret, { to: 'string' });
    };

    test = async () => {
        const origin = {
            '@context': ['https://www.w3.org/2018/credentials/v1', 'https://schema.org'],
            id: 'did:infra:space:5FDseiC76zPek2YYkuyenu4ZgxZ7PUWXt9d19HNB5CaQXt5U',
            type: ['VerifiableCredential', 'VaccinationCredential'],
            credentialSubject: {
                id: 'did:infra:space:5CfVpNJWhHeeb8EWhwKzUk3phDNtUNigCAjnSBYD7S6MnD2d',
                test: '123',
                alumniOf: 'Example University',
                email: 'test@test.com',
            },
            issuanceDate: '2023-03-22T06:51:36.019Z',
        };
        const originString = JSON.stringify(origin);
        const shares = 5;
        const threshold = 3;
        const base = 'base64' as SupportedBase;
        const shards = await this.stringToShards64(originString, shares, threshold, base);
        const partialShards = shards.sort(() => 0.5 - Math.random()).slice(0, threshold);
        const restored = await this.shards64ToString(partialShards, base);

        console.log('-------------------');
        console.log(`use ${base} encoding, Gzip/Deflate and split into ${shares} shards with threshold ${threshold}`);
        console.log(`origin string(length: ${originString.length}):\n\n${originString}\n`);
        console.log(`shard length: ${shards[0].length} * 5 = ${shards[0].length * 5}`);
        console.log(
            `Match between partial shards(${threshold}) restored data and origin data:  ${restored === originString}`,
        );
        console.log('shards:');
        console.log(shards);
    };
}

export default ShamirSharing;
