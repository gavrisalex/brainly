package com.example.QA.mail;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

@SpringBootApplication
public class JavaSmtpGmailSenderApplication {

    @Autowired
    private JavaSmtpGmailSenderService senderService;

    public static void main(String[] args) {
        SpringApplication.run(JavaSmtpGmailSenderApplication.class, args);
    }

    public void sendMail(String to, String subject, String body) {
        senderService.sendEmail(to, subject, body);
    }
}
