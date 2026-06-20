package authservice.controller;

import authservice.entities.RefreshToken;
import authservice.model.UserInfoDto;
import authservice.response.JwtResponseDTO;
import authservice.service.JwtService;
import authservice.service.RefreshTokenService;
import authservice.service.TokenBlocklistService;
import authservice.service.UserDetailsServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.Objects;

@AllArgsConstructor
@RestController
public class AuthController
{

    @Autowired
    private JwtService jwtService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private TokenBlocklistService tokenBlocklistService;

    @PostMapping("auth/v1/signup")
    public ResponseEntity SignUp(@Valid @RequestBody UserInfoDto userInfoDto){
        String userId = userDetailsService.signupUser(userInfoDto);
        if (Objects.isNull(userId)) {
            return new ResponseEntity<>("Already Exist", HttpStatus.BAD_REQUEST);
        }
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userInfoDto.getUsername());
        String jwtToken = jwtService.GenerateToken(userInfoDto.getUsername());
        return new ResponseEntity<>(JwtResponseDTO.builder()
                .accessToken(jwtToken)
                .token(refreshToken.getToken())
                .userId(userId)
                .build(), HttpStatus.OK);
    }

    @GetMapping("/auth/v1/ping")
    public ResponseEntity<String> ping() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String userId = userDetailsService.getUserByUsername(authentication.getName());
            if (Objects.nonNull(userId)) {
                return ResponseEntity.ok(userId);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
    }

    @DeleteMapping("/auth/v1/logout")
    public ResponseEntity<Boolean> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return new ResponseEntity<>(false, HttpStatus.BAD_REQUEST);
        }
        String token = authHeader.substring(7);
        Date expiry = jwtService.extractExpiration(token);
        tokenBlocklistService.blockToken(token, expiry);

        String username = jwtService.extractUsername(token);
        refreshTokenService.deleteByUsername(username);

        SecurityContextHolder.clearContext();
        return new ResponseEntity<>(true, HttpStatus.OK);
    }

    @GetMapping("/health")
    public ResponseEntity<Boolean> checkHealth(){
        return new ResponseEntity<>(true, HttpStatus.OK);
    }

}
