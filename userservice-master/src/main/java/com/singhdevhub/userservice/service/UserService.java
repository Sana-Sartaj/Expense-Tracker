package com.singhdevhub.userservice.service;

import com.singhdevhub.userservice.entities.UserInfo;
import com.singhdevhub.userservice.entities.UserInfoDto;
import com.singhdevhub.userservice.exception.ResourceNotFoundException;
import com.singhdevhub.userservice.repository.UserRepository;
import com.singhdevhub.userservice.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.function.Supplier;
import java.util.function.UnaryOperator;

@Service
@RequiredArgsConstructor
public class UserService
{
    @Autowired
    private final UserRepository userRepository;

    public UserInfoDto createOrUpdateUser(UserInfoDto userInfoDto){
        ValidationUtil.requireNonNull(userInfoDto, "userInfoDto");
        ValidationUtil.requireNonBlank(userInfoDto.getUserId(), "userId");
        ValidationUtil.requireNonBlank(userInfoDto.getFirstName(), "firstName");
        ValidationUtil.requireNonBlank(userInfoDto.getLastName(), "lastName");
        ValidationUtil.requireNonBlank(userInfoDto.getEmail(), "email");
        ValidationUtil.requireNonNull(userInfoDto.getPhoneNumber(), "phoneNumber");
        UnaryOperator<UserInfo> updatingUser = user -> {
            return userRepository.save(userInfoDto.transformToUserInfo());
        };

        Supplier<UserInfo> createUser = () -> {
             return userRepository.save(userInfoDto.transformToUserInfo());
        };

        UserInfo userInfo = userRepository.findByUserId(userInfoDto.getUserId())
                .map(updatingUser)
                .orElseGet(createUser);
        return new UserInfoDto(
                userInfo.getUserId(),
                userInfo.getFirstName(),
                userInfo.getLastName(),
                userInfo.getPhoneNumber(),
                userInfo.getEmail(),
                userInfo.getProfilePic()
        );
    }

    public UserInfoDto getUser(String userId) {
        return userRepository.findByUserId(userId)
                .map(userInfo -> new UserInfoDto(
                        userInfo.getUserId(),
                        userInfo.getFirstName(),
                        userInfo.getLastName(),
                        userInfo.getPhoneNumber(),
                        userInfo.getEmail(),
                        userInfo.getProfilePic()
                ))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }

}
