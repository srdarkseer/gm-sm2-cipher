/**
 * Example usage of gm-sm2-cipher
 * 
 * Make sure to:
 * 1. Build the Java component: npm run build:java
 * 2. Build TypeScript: npm run build:typescript
 * 3. Have Java 17+ installed
 */

const { SM2Service } = require('./lib/index');

async function example() {
  console.log('🔍 Checking Java availability...');
  const isJavaAvailable = await SM2Service.isJavaAvailable();
  console.log('Java available:', isJavaAvailable);

  if (!isJavaAvailable) {
    console.error('❌ Java is not available. Please install Java 17+');
    process.exit(1);
  }

  // Create a service instance - we'll generate keys first
  const sm2Service = new SM2Service('dummy', 'dummy');

  console.log('\n🔍 Checking SM2 service availability...');
  const isServiceAvailable = await sm2Service.isAvailable();
  console.log('SM2 service available:', isServiceAvailable);

  if (!isServiceAvailable) {
    console.error('❌ SM2 service is not available. Please build the Java component: npm run build:java');
    process.exit(1);
  }

  try {
    // Generate a new key pair
    console.log('\n🔑 Generating SM2 key pair...');
    const keyPair = await sm2Service.generateKeyPair();
    console.log('Private Key:', keyPair.privateKey);
    console.log('Public Key:', keyPair.publicKey);

    // Create a new service instance with the generated keys
    const service = new SM2Service(keyPair.privateKey, keyPair.publicKey);

    const plaintext = 'Hello, World!';
    console.log('\n🔐 Encrypting:', plaintext);

    const encrypted = await service.encrypt(plaintext, keyPair.publicKey);
    console.log('Encrypted:', encrypted);

    console.log('\n🔓 Decrypting...');
    const decrypted = await service.decrypt(encrypted);
    console.log('Decrypted:', decrypted);

    if (decrypted === plaintext) {
      console.log('\n✅ Encryption/Decryption test PASSED!');
    } else {
      console.log('\n❌ Encryption/Decryption test FAILED!');
      console.log('Expected:', plaintext);
      console.log('Got:', decrypted);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

example().catch(console.error);

