package com.cicd.monitoring.config;

import com.cicd.monitoring.model.Role;
import com.cicd.monitoring.model.User;
import com.cicd.monitoring.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User admin = new User(
                "admin",
                "admin@monitoring.com",
                encoder.encode("admin123")
            );

            Set<Role> roles = new HashSet<>();
            roles.add(Role.ROLE_ADMIN);
            roles.add(Role.ROLE_USER);
            admin.setRoles(roles);

            userRepository.save(admin);
            System.out.println(">>> Default Admin User Created: admin / admin123");
        }
    }
}
