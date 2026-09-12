package com.gitgud.util;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Random;

@Component
public class RoomCodeGenerator {

    public static final int CODE_LENGTH = 6;

    private static final char[] ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".toCharArray();

    private final Random random;

    public RoomCodeGenerator() {
        this(new SecureRandom());
    }

    RoomCodeGenerator(Random random) {
        this.random = random;
    }

    public String next() {
        char[] code = new char[CODE_LENGTH];
        for (int index = 0; index < CODE_LENGTH; index++) {
            code[index] = ALPHABET[random.nextInt(ALPHABET.length)];
        }
        return new String(code);
    }
}
