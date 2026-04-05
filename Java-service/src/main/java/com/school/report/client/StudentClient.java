package com.school.report.client;

import com.school.report.dto.StudentDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

@Component
public class StudentClient {

    private final RestTemplate restTemplate;
    private final String backendBaseUrl;

    public StudentClient(
            RestTemplate restTemplate,
            @Value("${school.backend.base-url}") String backendBaseUrl) {
        this.restTemplate = restTemplate;
        this.backendBaseUrl = backendBaseUrl;
    }

    public Optional<StudentDto> findById(String studentId) {
        String url = backendBaseUrl + "/api/v1/students/internal/" + studentId;
        try {
            StudentDto student = restTemplate.getForObject(url, StudentDto.class);
            return Optional.ofNullable(student);
        } catch (HttpClientErrorException.NotFound e) {
            return Optional.empty();
        }
    }
}
