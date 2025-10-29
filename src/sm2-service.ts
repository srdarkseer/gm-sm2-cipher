import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

/**
 * SM2 Service for encryption and decryption using Java
 * Wraps the Java-based SM2 service for Node.js usage
 */
export class SM2Service {
  private javaJarPath: string;
  private privateKey: string;
  private publicKey: string;

  constructor(privateKey: string, publicKey?: string) {
    this.privateKey = privateKey;
    this.publicKey = publicKey || '';
    
    // Try to locate the JAR file in different possible locations
    const possiblePaths = [
      path.join(__dirname, '..', 'java-utils', 'target', 'sm2-service-1.0.0.jar'),
      path.join(process.cwd(), 'java-utils', 'target', 'sm2-service-1.0.0.jar'),
      path.join(__dirname, '..', '..', 'java-utils', 'target', 'sm2-service-1.0.0.jar'),
    ];

    // Find the first existing path
    let foundPath: string | null = null;
    for (const jarPath of possiblePaths) {
      if (fs.existsSync(jarPath)) {
        foundPath = jarPath;
        break;
      }
    }

    if (!foundPath) {
      throw new Error(
        `SM2 service JAR not found. Tried: ${possiblePaths.join(', ')}. ` +
        `Please build the Java service first using 'npm run build:java' or 'mvn clean package' in the java-utils directory.`
      );
    }

    this.javaJarPath = foundPath;
  }

  /**
   * Encrypt plaintext using SM2 public key
   * @param plaintext - The text to encrypt
   * @param publicKey - The public key (hex string). If not provided, uses the key from constructor.
   * @returns Promise resolving to encrypted hex string
   */
  async encrypt(plaintext: string, publicKey?: string): Promise<string> {
    const pubKey = publicKey || this.publicKey;
    if (!pubKey) {
      throw new Error('Public key is required for encryption');
    }

    return new Promise((resolve, reject) => {
      const javaProcess: ChildProcess = spawn('java', [
        '-jar',
        this.javaJarPath,
        '--encrypt',
        plaintext,
        '--public-key',
        pubKey
      ]);

      let stdout = '';
      let stderr = '';

      if (javaProcess.stdout) {
        javaProcess.stdout.on('data', (data: Buffer) => {
          stdout += data.toString();
        });
      }

      if (javaProcess.stderr) {
        javaProcess.stderr.on('data', (data: Buffer) => {
          stderr += data.toString();
        });
      }

      javaProcess.on('close', (code: number | null) => {
        if (code !== 0) {
          reject(new Error(`SM2 encryption failed: ${stderr || 'Process exited with code ' + code}`));
        } else {
          resolve(stdout.trim());
        }
      });

      javaProcess.on('error', (error: Error) => {
        reject(new Error(`SM2 encryption process failed: ${error.message}`));
      });
    });
  }

  /**
   * Decrypt encrypted data using SM2 private key
   * @param encryptedData - The encrypted hex string
   * @returns Promise resolving to decrypted plaintext
   */
  async decrypt(encryptedData: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const javaProcess: ChildProcess = spawn('java', [
        '-jar',
        this.javaJarPath,
        '--decrypt',
        encryptedData,
        '--private-key',
        this.privateKey
      ]);

      let stdout = '';
      let stderr = '';

      if (javaProcess.stdout) {
        javaProcess.stdout.on('data', (data: Buffer) => {
          stdout += data.toString();
        });
      }

      if (javaProcess.stderr) {
        javaProcess.stderr.on('data', (data: Buffer) => {
          stderr += data.toString();
        });
      }

      javaProcess.on('close', (code: number | null) => {
        if (code !== 0) {
          reject(new Error(`SM2 decryption failed: ${stderr || 'Process exited with code ' + code}`));
        } else {
          resolve(stdout.trim());
        }
      });

      javaProcess.on('error', (error: Error) => {
        reject(new Error(`SM2 decryption process failed: ${error.message}`));
      });
    });
  }

  /**
   * Generate SM2 key pair
   * @returns Promise resolving to object with privateKey and publicKey
   */
  async generateKeyPair(): Promise<{ privateKey: string; publicKey: string }> {
    return new Promise((resolve, reject) => {
      const javaProcess: ChildProcess = spawn('java', [
        '-jar',
        this.javaJarPath,
        '--generate-keypair'
      ]);

      let stdout = '';
      let stderr = '';

      if (javaProcess.stdout) {
        javaProcess.stdout.on('data', (data: Buffer) => {
          stdout += data.toString();
        });
      }

      if (javaProcess.stderr) {
        javaProcess.stderr.on('data', (data: Buffer) => {
          stderr += data.toString();
        });
      }

      javaProcess.on('close', (code: number | null) => {
        if (code !== 0) {
          reject(new Error(`SM2 key generation failed: ${stderr || 'Process exited with code ' + code}`));
        } else {
          // Parse output: "Private Key: ...\nPublic Key: ..."
          const lines = stdout.trim().split('\n');
          const privateKeyLine = lines.find(line => line.startsWith('Private Key: '));
          const publicKeyLine = lines.find(line => line.startsWith('Public Key: '));
          
          if (!privateKeyLine || !publicKeyLine) {
            reject(new Error('Failed to parse key pair from output'));
            return;
          }
          
          const privateKey = privateKeyLine.replace('Private Key: ', '').trim();
          const publicKey = publicKeyLine.replace('Public Key: ', '').trim();
          
          resolve({ privateKey, publicKey });
        }
      });

      javaProcess.on('error', (error: Error) => {
        reject(new Error(`SM2 key generation process failed: ${error.message}`));
      });
    });
  }

  /**
   * Check if Java service is available
   * @returns Promise resolving to true if service is available
   */
  async isAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      const javaProcess = spawn('java', ['-jar', this.javaJarPath, '--test']);

      javaProcess.on('close', (code) => {
        resolve(code === 0);
      });

      javaProcess.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Static method to check if Java is installed
   * @returns Promise resolving to true if Java is available
   */
  static async isJavaAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      const javaProcess = spawn('java', ['-version']);

      javaProcess.on('close', (code) => {
        resolve(code === 0);
      });

      javaProcess.on('error', () => {
        resolve(false);
      });
    });
  }
}

