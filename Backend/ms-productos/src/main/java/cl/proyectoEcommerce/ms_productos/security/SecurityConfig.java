package cl.proyectoEcommerce.ms_productos.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.web.SecurityFilterChain;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final String tenantId;
    private final String clientId;

    // Inyección de dependencias por constructor sin Lombok
    public SecurityConfig(
            @Value("${spring.security.oauth2.resourceserver.jwt.tenant-id}") String tenantId,
            @Value("${spring.security.oauth2.resourceserver.jwt.client-id}") String clientId) {
        this.tenantId = tenantId;
        this.clientId = clientId;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // 1. Endpoints públicos de Swagger / OpenAPI
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/error").permitAll()

                        // 2. LECTURA PÚBLICA: Cualquier persona puede ver el catálogo de productos (GET)
                        .requestMatchers(HttpMethod.GET, "/api/v1/productos/**").permitAll()

                        // 3. ESCRITURA PROTEGIDA: Crear, Editar o Eliminar requiere JWT autenticado
                        .requestMatchers(HttpMethod.POST, "/api/v1/productos/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/productos/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/productos/**").authenticated()

                        // Cualquier otra petición no especificada requiere autenticación
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt -> jwt.decoder(jwtDecoder()))
                );

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        // JWKS URI global v2.0 de Microsoft Azure AD
        String jwkSetUri = "https://login.microsoftonline.com/" + tenantId + "/discovery/v2.0/keys";
        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();

        // Validador de expiración del token
        OAuth2TokenValidator<Jwt> withTimestamp = new JwtTimestampValidator();

        // Validador flexible de Issuer (Acepta v2.0 y sts.windows.net para client_credentials)
        OAuth2TokenValidator<Jwt> issuerValidator = jwt -> {
            String issuer = jwt.getIssuer() != null ? jwt.getIssuer().toString() : "";
            if (issuer.equals("https://login.microsoftonline.com/" + tenantId + "/v2.0") ||
                    issuer.equals("https://sts.windows.net/" + tenantId + "/")) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_issuer", "El emisor del token '" + issuer + "' no es valido.", null)
            );
        };

        // Validador de Audiencia (Client ID de Azure)
        OAuth2TokenValidator<Jwt> audienceValidator = jwt -> {
            List<String> audience = jwt.getAudience();
            if (audience != null && (audience.contains(clientId) || audience.contains("api://" + clientId))) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_audience", "La audiencia del token no coincide con ms-productos.", null)
            );
        };

        // Combinar todos los validadores
        jwtDecoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(withTimestamp, issuerValidator, audienceValidator));

        return jwtDecoder;
    }
}