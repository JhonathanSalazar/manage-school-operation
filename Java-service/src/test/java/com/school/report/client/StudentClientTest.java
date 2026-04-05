package com.school.report.client;

import com.school.report.dto.StudentDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentClientTest {

    @Mock
    private RestTemplate restTemplate;

    private StudentClient studentClient;

    @BeforeEach
    void setUp() {
        studentClient = new StudentClient(restTemplate, "http://localhost:5007");
    }

    @Test
    void findById_shouldReturnStudent_whenBackendResponds() {
        StudentDto expected = new StudentDto();
        expected.setId("abc-123");
        expected.setFirstName("Jane");
        expected.setLastName("Doe");

        when(restTemplate.getForObject(
                eq("http://localhost:5007/api/v1/students/internal/abc-123"),
                eq(StudentDto.class)))
                .thenReturn(expected);

        Optional<StudentDto> result = studentClient.findById("abc-123");

        assertTrue(result.isPresent());
        assertEquals("Jane", result.get().getFirstName());
        assertEquals("Doe", result.get().getLastName());
    }

    @Test
    void findById_shouldReturnEmpty_whenBackendReturns404() {
        when(restTemplate.getForObject(anyString(), eq(StudentDto.class)))
                .thenThrow(HttpClientErrorException.NotFound.class);

        Optional<StudentDto> result = studentClient.findById("non-existent");

        assertTrue(result.isEmpty());
    }

    @Test
    void findById_shouldBuildCorrectUrl() {
        when(restTemplate.getForObject(anyString(), eq(StudentDto.class))).thenReturn(null);

        studentClient.findById("student-xyz");

        verify(restTemplate).getForObject(
                eq("http://localhost:5007/api/v1/students/internal/student-xyz"),
                eq(StudentDto.class));
    }
}
