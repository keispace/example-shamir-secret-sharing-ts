# Example Sharmirs Secret Sharing TypeScript

ecmascript & TS example of Shamirs Secret Sharing algorithm

```
> npm install
> npm run test

-------------------
use base64 encoding, Gzip/Deflate and split into 5 shards with threshold 3
origin string(length: 409):

{"@context":["https://www.w3.org/2018/credentials/v1","https://schema.org"],"id":"did:infra:space:5FDseiC76zPek2YYkuyenu4ZgxZ7PUWXt9d19HNB5CaQXt5U","type":["VerifiableCredential","VaccinationCredential"],"credentialSubject":{"id":"did:infra:space:5CfVpNJWhHeeb8EWhwKzUk3phDNtUNigCAjnSBYD7S6MnD2d","test":"123","alumniOf":"Example University","email":"test@test.com"},"issuanceDate":"2023-03-22T06:51:36.019Z"}

shard length: 415 * 5 = 2075
Match between partial shards(3) restored data and origin data:  true
shards:
[
  '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'
]
```