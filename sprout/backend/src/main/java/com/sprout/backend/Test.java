package com.sprout.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.File;

@Component
public class Test implements CommandLineRunner {

    @Value("${DB_PASSWORD:NOT_FOUND}")
    private String password;

    @Override
    public void run(String... args) {
        File env = new File(".env");

        System.out.println("Working Directory = " + System.getProperty("user.dir"));
        System.out.println(".env exists = " + env.exists());
        System.out.println(".env path = " + env.getAbsolutePath());
        System.out.println("DB_PASSWORD = " + password);
    }
}