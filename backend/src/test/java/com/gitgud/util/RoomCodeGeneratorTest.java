package com.gitgud.util;

import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Random;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RoomCodeGeneratorTest {

    @Test
    void generatesCodesOfTheConfiguredLength() {
        RoomCodeGenerator generator = new RoomCodeGenerator(new Random(1));

        assertEquals(RoomCodeGenerator.CODE_LENGTH, generator.next().length());
    }

    @Test
    void generatesUppercaseAlphanumericCodes() {
        RoomCodeGenerator generator = new RoomCodeGenerator(new Random(2));

        for (int draw = 0; draw < 200; draw++) {
            assertTrue(generator.next().matches("[A-Z0-9]{6}"));
        }
    }

    @Test
    void producesDistinctCodesAcrossDraws() {
        RoomCodeGenerator generator = new RoomCodeGenerator(new Random(3));

        Set<String> codes = new HashSet<>();
        for (int draw = 0; draw < 200; draw++) {
            codes.add(generator.next());
        }

        assertEquals(200, codes.size());
    }
}
