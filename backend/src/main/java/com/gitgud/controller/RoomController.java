package com.gitgud.controller;

import com.gitgud.dto.PlayerMapper;
import com.gitgud.dto.RoomCreatedResponse;
import com.gitgud.dto.RoomStatusDto;
import com.gitgud.model.GameRoom;
import com.gitgud.service.RoomService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/rooms")
public class RoomController {

    private static final String ROOMS_PATH = "/api/v1/rooms/";

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    @SuppressWarnings("null")
    public ResponseEntity<RoomCreatedResponse> create() {
        GameRoom room = roomService.create();
        return ResponseEntity.created(URI.create(ROOMS_PATH + room.getCode()))
                .body(new RoomCreatedResponse(room.getCode()));
    }

    @GetMapping("/{code}")
    public RoomStatusDto status(@PathVariable String code) {
        GameRoom room = roomService.require(code);
        return new RoomStatusDto(room.getCode(), room.getState(),
                PlayerMapper.toDtos(roomService.players(room.getCode())));
    }
}
