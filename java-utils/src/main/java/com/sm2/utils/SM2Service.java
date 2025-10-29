package com.sm2.utils;

import org.bouncycastle.asn1.gm.GMNamedCurves;
import org.bouncycastle.asn1.x9.X9ECParameters;
import org.bouncycastle.crypto.engines.SM2Engine;
import org.bouncycastle.crypto.params.*;
import org.bouncycastle.math.ec.ECPoint;
import org.bouncycastle.util.encoders.Hex;

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
}

