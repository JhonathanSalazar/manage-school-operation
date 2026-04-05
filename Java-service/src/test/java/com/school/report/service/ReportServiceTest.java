package com.school.report.service;

import com.school.report.client.StudentClient;
import com.school.report.dto.StudentDto;
import com.school.report.pdf.PdfGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private StudentClient studentClient;

    @Mock
    private PdfGenerator pdfGenerator;

    @InjectMocks
    private ReportService reportService;

    private StudentDto sampleStudent;

    @BeforeEach
    void setUp() {
        sampleStudent = new StudentDto();
        sampleStudent.setId("test-id-123");
        sampleStudent.setFirstName("Jane");
        sampleStudent.setLastName("Doe");
        sampleStudent.setStudentCode("STU-001");
    }

    @Test
    void generateReport_shouldReturnPdfBytes_whenStudentExists() {
        byte[] expectedPdf = new byte[]{1, 2, 3, 4};
        when(studentClient.findById("test-id-123")).thenReturn(Optional.of(sampleStudent));
        when(pdfGenerator.generateStudentReport(sampleStudent)).thenReturn(expectedPdf);

        byte[] result = reportService.generateReport("test-id-123");

        assertNotNull(result);
        assertArrayEquals(expectedPdf, result);
        verify(studentClient).findById("test-id-123");
        verify(pdfGenerator).generateStudentReport(sampleStudent);
    }

    @Test
    void generateReport_shouldThrow404_whenStudentNotFound() {
        when(studentClient.findById("unknown-id")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> reportService.generateReport("unknown-id"));

        assertEquals(404, ex.getStatusCode().value());
        verify(pdfGenerator, never()).generateStudentReport(any());
    }
}
