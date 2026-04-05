package com.school.report.service;

import com.school.report.client.StudentClient;
import com.school.report.dto.StudentDto;
import com.school.report.pdf.PdfGenerator;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReportService {

    private final StudentClient studentClient;
    private final PdfGenerator pdfGenerator;

    public ReportService(StudentClient studentClient, PdfGenerator pdfGenerator) {
        this.studentClient = studentClient;
        this.pdfGenerator = pdfGenerator;
    }

    public byte[] generateReport(String studentId) {
        StudentDto student = studentClient.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Student not found: " + studentId));

        return pdfGenerator.generateStudentReport(student);
    }
}
