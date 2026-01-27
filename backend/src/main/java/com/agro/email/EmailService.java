package com.agro.email;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("onboarding@resend.dev");
        message.setTo(to);
        message.setSubject("Verification Code - Agro");
        message.setText("Welcome to Agro!\n\nYour verification code is: " + code
                + "\n\nPlease enter this code to activate your account.");
        mailSender.send(message);
    }
}
