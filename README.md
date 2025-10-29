# gm-sm2-cipher

**Package Name:** `gm-sm2-cipher`

A Node.js package for SM2 encryption and decryption using Java with BouncyCastle library. This package provides a TypeScript/JavaScript wrapper around a Java-based SM2 cryptographic service.

## Features

- 🔐 **SM2 Encryption/Decryption** - Chinese national cryptography standard
- 🚀 **Java-based** - Uses BouncyCastle for reliable, production-ready cryptography
- 📦 **npm Package** - Easy to install and use in Node.js projects
- 🔄 **TypeScript Support** - Full type definitions included
- 🎯 **Simple API** - Clean, promise-based interface
- 🔑 **Key Generation** - Built-in SM2 key pair generation

## Prerequisites

- **Java 17+** - Required to run the SM2 service
- **Maven** - Required to build the Java component (only for development)
- **Node.js 14+** - Required for the npm package

## Installation

```bash
npm install gm-sm2-cipher
```

Or install from local directory:

```bash
npm install /path/to/gm-sm2-cipher
```

## Docker Support

The project includes Docker support for easy deployment and development.

### Building Docker Image

```bash
# Build the Docker image
docker build -t gm-sm2-cipher:latest .
```

### Running with Docker

```bash
# Run the container interactively
docker run -it --rm gm-sm2-cipher:latest

# Run with mounted volumes for development
docker run -it --rm \
  -v $(pwd)/src:/app/src:ro \
  -v $(pwd)/example.js:/app/example.js:ro \
  -v $(pwd)/lib:/app/lib:rw \
  gm-sm2-cipher:latest
```

### Using Docker Compose

```bash
# Build and start the service
docker-compose up -d

# Run the example
docker-compose --profile example run --rm gm-sm2-cipher-example

# Access the container shell
docker-compose exec gm-sm2-cipher /bin/bash

# Stop the services
docker-compose down
```

### Docker Development Workflow

```bash
# 1. Build the image
docker build -t gm-sm2-cipher:latest .

# 2. Run the container
docker run -it --rm gm-sm2-cipher:latest /bin/bash

# 3. Inside the container, you can:
#    - Run the example: node example.js
#    - Use Node.js REPL: node
#    - Test encryption/decryption with your own code
```

## Building from Source

If you're building from source, first build the Java component:

```bash
# Install dependencies
npm install

# Build Java service
npm run build:java

# Build TypeScript
npm run build:typescript

# Or build both
npm run build
```

## Usage

### Basic Example

```typescript
import { SM2Service } from 'gm-sm2-cipher';

// Initialize with private key (and optionally public key)
const privateKey = 'your-private-key-hex-string';
const publicKey = 'your-public-key-hex-string';

const sm2Service = new SM2Service(privateKey, publicKey);

// Encrypt data
try {
  const encrypted = await sm2Service.encrypt('Hello, World!', publicKey);
  console.log('Encrypted:', encrypted);
} catch (error) {
  console.error('Encryption failed:', error);
}

// Decrypt data
try {
  const decrypted = await sm2Service.decrypt(encrypted);
  console.log('Decrypted:', decrypted);
} catch (error) {
  console.error('Decryption failed:', error);
}
```

### Generate Key Pair

```typescript
import { SM2Service } from 'gm-sm2-cipher';

// Create a temporary service instance
const tempService = new SM2Service('dummy', 'dummy');

// Generate a new key pair
const keyPair = await tempService.generateKeyPair();
console.log('Private Key:', keyPair.privateKey);
console.log('Public Key:', keyPair.publicKey);

// Use the generated keys
const sm2Service = new SM2Service(keyPair.privateKey, keyPair.publicKey);
```

### JavaScript Example

```javascript
const { SM2Service } = require('gm-sm2-cipher');

const privateKey = 'your-private-key-hex-string';
const publicKey = 'your-public-key-hex-string';

const sm2Service = new SM2Service(privateKey, publicKey);

// Encrypt
sm2Service.encrypt('Hello, World!', publicKey)
  .then(encrypted => {
    console.log('Encrypted:', encrypted);
    // Decrypt
    return sm2Service.decrypt(encrypted);
  })
  .then(decrypted => {
    console.log('Decrypted:', decrypted);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### Check Service Availability

```typescript
// Check if Java is available
const isJavaAvailable = await SM2Service.isJavaAvailable();
console.log('Java available:', isJavaAvailable);

// Check if SM2 service is working
const sm2Service = new SM2Service('dummy', 'dummy');
const isServiceAvailable = await sm2Service.isAvailable();
console.log('SM2 service available:', isServiceAvailable);
```

## API Reference

### `SM2Service`

#### Constructor

```typescript
new SM2Service(privateKey: string, publicKey?: string)
```

- `privateKey` (required): Private key as hex string
- `publicKey` (optional): Public key as hex string (can be provided later when encrypting)

#### Methods

##### `encrypt(plaintext: string, publicKey?: string): Promise<string>`

Encrypts plaintext using SM2 encryption.

- `plaintext`: The text to encrypt
- `publicKey`: Public key (hex string). If not provided, uses the key from constructor.
- Returns: Promise resolving to encrypted hex string

##### `decrypt(encryptedData: string): Promise<string>`

Decrypts encrypted data using SM2 decryption.

- `encryptedData`: The encrypted hex string
- Returns: Promise resolving to decrypted plaintext

##### `generateKeyPair(): Promise<{ privateKey: string; publicKey: string }>`

Generates a new SM2 key pair.

- Returns: Promise resolving to object with `privateKey` and `publicKey` (both hex strings)

##### `isAvailable(): Promise<boolean>`

Checks if the Java SM2 service is available and working.

##### `static isJavaAvailable(): Promise<boolean>`

Static method to check if Java is installed on the system.

## SM2 Key Format

- **Private Key**: 64-character hex string (32 bytes)
- **Public Key**: 130-character hex string (65 bytes, including 04 prefix)

## Project Structure

```
gm-sm2-cipher/
├── java-utils/              # Java Maven project
│   ├── src/
│   │   └── main/
│   │       └── java/
│   │           └── com/
│   │               └── sm2/
│   │                   └── utils/
│   │                       └── SM2Service.java
│   ├── target/              # Build output (JAR file)
│   └── pom.xml
├── src/                     # TypeScript source
│   ├── index.ts
│   └── sm2-service.ts
├── lib/                     # Compiled JavaScript and types
├── package.json
├── tsconfig.json
└── README.md
```

## Development

### Requirements

- Java 17+
- Maven 3.6+
- Node.js 14+
- TypeScript 5.2+

### Build Commands

```bash
# Build Java component only
npm run build:java

# Build TypeScript only
npm run build:typescript

# Build both
npm run build

# Clean build artifacts
npm run clean
```

### Publishing

```bash
# Build everything
npm run build

# Publish to npm
npm publish
```

## License

**License:** MIT

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

See [LICENSE](./LICENSE) file for the full license text.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

