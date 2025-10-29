package com.sm2.utils;

import org.bouncycastle.asn1.gm.GMNamedCurves;
import org.bouncycastle.asn1.x9.X9ECParameters;
import org.bouncycastle.crypto.AsymmetricCipherKeyPair;
import org.bouncycastle.crypto.engines.SM2Engine;
import org.bouncycastle.crypto.generators.ECKeyPairGenerator;
import org.bouncycastle.crypto.params.*;
import org.bouncycastle.math.ec.ECPoint;
import org.bouncycastle.util.encoders.Hex;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;

/**
 * SM2 Encryption/Decryption Service
 * Uses BouncyCastle library for SM2 (Chinese national cryptography standard)
 */
public class SM2Service {
    
    private static X9ECParameters x9ECParameters = GMNamedCurves.getByName("sm2p256v1");
    private static ECDomainParameters ecDomainParameters = new ECDomainParameters(
        x9ECParameters.getCurve(), 
        x9ECParameters.getG(), 
        x9ECParameters.getN()
    );
    
    private String privateKey;
    private String publicKey;
    
    public SM2Service(String privateKey) {
        this.privateKey = privateKey;
    }
    
    public SM2Service(String privateKey, String publicKey) {
        this.privateKey = privateKey;
        this.publicKey = publicKey;
    }
    
    /**
     * Encrypt data using SM2 public key
     * Uses C1C3C2 mode for compatibility with common implementations
     */
    public String encrypt(String plainText, String pubKey) {
        try {
            byte[] plainTextBytes = plainText.getBytes(StandardCharsets.UTF_8);
            
            // Parse public key
            byte[] pubKeyBytes = Hex.decode(pubKey);
            ECPoint pubKeyPoint = x9ECParameters.getCurve().decodePoint(pubKeyBytes);
            ECPublicKeyParameters publicKeyParameters = new ECPublicKeyParameters(pubKeyPoint, ecDomainParameters);
            
            // Wrap with SecureRandom for encryption
            ParametersWithRandom parametersWithRandom = new ParametersWithRandom(
                publicKeyParameters, 
                new SecureRandom()
            );
            
            // Initialize SM2 engine for encryption with C1C3C2 mode
            SM2Engine sm2Engine = new SM2Engine(SM2Engine.Mode.C1C3C2);
            sm2Engine.init(true, parametersWithRandom);
            
            // Encrypt
            byte[] encryptedBytes = sm2Engine.processBlock(plainTextBytes, 0, plainTextBytes.length);
            return Hex.toHexString(encryptedBytes);
        } catch (Exception e) {
            throw new RuntimeException("SM2 encryption failed: " + e.getMessage(), e);
        }
    }
    
    /**
     * Decrypt SM2 encrypted data using C1C3C2 mode first, with fallback to C1C2C3
     */
    public String decrypt(String cipherData) {
        try {
            byte[] cipherDataByte = Hex.decode(cipherData);
            BigInteger privateKeyD = new BigInteger(privateKey, 16);
            ECPrivateKeyParameters privateKeyParameters = new ECPrivateKeyParameters(privateKeyD, ecDomainParameters);
            
            // Try C1C3C2 mode first (most common)
            try {
                SM2Engine sm2Engine = new SM2Engine(SM2Engine.Mode.C1C3C2);
                sm2Engine.init(false, privateKeyParameters);
                byte[] arrayOfBytes = sm2Engine.processBlock(cipherDataByte, 0, cipherDataByte.length);
                return new String(arrayOfBytes, StandardCharsets.UTF_8);
            } catch (Exception e1) {
                // Fallback to C1C2C3 mode if C1C3C2 fails
                try {
                    SM2Engine sm2Engine = new SM2Engine(SM2Engine.Mode.C1C2C3);
                    sm2Engine.init(false, privateKeyParameters);
                    byte[] arrayOfBytes = sm2Engine.processBlock(cipherDataByte, 0, cipherDataByte.length);
                    return new String(arrayOfBytes, StandardCharsets.UTF_8);
                } catch (Exception e2) {
                    throw new RuntimeException("SM2 decryption failed with both C1C3C2 and C1C2C3 modes: " + e2.getMessage(), e2);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("SM2 decryption failed: " + e.getMessage(), e);
        }
    }
    
    /**
     * Generate SM2 key pair
     * @return Array with [privateKey (hex), publicKey (hex)]
     */
    public static String[] generateKeyPair() {
        try {
            ECKeyPairGenerator keyPairGenerator = new ECKeyPairGenerator();
            ECKeyGenerationParameters keyGenParams = new ECKeyGenerationParameters(ecDomainParameters, new SecureRandom());
            keyPairGenerator.init(keyGenParams);
            
            AsymmetricCipherKeyPair keyPair = keyPairGenerator.generateKeyPair();
            
            // Extract private key
            ECPrivateKeyParameters privateKeyParams = (ECPrivateKeyParameters) keyPair.getPrivate();
            String privateKey = privateKeyParams.getD().toString(16);
            // Pad private key to 64 hex chars if needed
            while (privateKey.length() < 64) {
                privateKey = "0" + privateKey;
            }
            
            // Extract public key
            ECPublicKeyParameters publicKeyParams = (ECPublicKeyParameters) keyPair.getPublic();
            byte[] publicKeyBytes = publicKeyParams.getQ().getEncoded(false);
            String publicKey = Hex.toHexString(publicKeyBytes);
            
            return new String[]{privateKey, publicKey};
        } catch (Exception e) {
            throw new RuntimeException("SM2 key pair generation failed: " + e.getMessage(), e);
        }
    }
}

