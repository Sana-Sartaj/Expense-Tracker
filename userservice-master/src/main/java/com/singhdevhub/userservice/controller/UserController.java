package com.singhdevhub.userservice.controller;

import com.singhdevhub.userservice.entities.UserInfoDto;
import com.singhdevhub.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user/v1")
@RequiredArgsConstructor
public class UserController
{

    @Autowired
    private UserService userService;

    @GetMapping("/getUser")
    public ResponseEntity<UserInfoDto> getUser(@RequestHeader(value = "X-User-Id") @NonNull String userId){
        UserInfoDto user = userService.getUser(userId);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PostMapping("/createUpdate")
    public ResponseEntity<UserInfoDto> createUpdateUser(@Valid @RequestBody UserInfoDto userInfoDto){
        UserInfoDto user = userService.createOrUpdateUser(userInfoDto);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @GetMapping("/health")
    public ResponseEntity<Boolean> checkHealth(){
        return new ResponseEntity<>(true, HttpStatus.OK);
    }

}
