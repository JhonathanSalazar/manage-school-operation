package com.school.report.pdf;

import com.school.report.dto.StudentDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PdfGeneratorTest {

    private PdfGenerator pdfGenerator;
    private StudentDto sampleStudent;

    @BeforeEach
    void setUp() {
        pdfGenerator = new PdfGenerator();

        sampleStudent = new StudentDto();
        sampleStudent.setId("test-id");
        sampleStudent.setFirstName("Jane");
        sampleStudent.setLastName("Doe");
        sampleStudent.setStudentCode("STU-001");
        sampleStudent.setEmail("jane.doe@school.com");
        sampleStudent.setDateOfBirth("2007-03-15");
        sampleStudent.setGender("female");
        sampleStudent.setPhone("+1-555-0201");
        sampleStudent.setAddress("123 Main St");
        sampleStudent.setGuardianName("Robert Doe");
        sampleStudent.setGuardianPhone("+1-555-0200");
        sampleStudent.setRollNumber("01");

        StudentDto.ClassDto classDto = new StudentDto.ClassDto();
        classDto.setId(2);
        classDto.setName("Grade 10");
        sampleStudent.setClassInfo(classDto);

        StudentDto.SectionDto sectionDto = new StudentDto.SectionDto();
        sectionDto.setId(3);
        sectionDto.setName("A");
        sampleStudent.setSection(sectionDto);
    }

    @Test
    void generateStudentReport_shouldReturnNonNullBytes() {
        byte[] result = pdfGenerator.generateStudentReport(sampleStudent);

        assertNotNull(result);
    }

    @Test
    void generateStudentReport_shouldReturnNonEmptyBytes() {
        byte[] result = pdfGenerator.generateStudentReport(sampleStudent);

        assertTrue(result.length > 0);
    }

    @Test
    void generateStudentReport_shouldStartWithPdfMagicBytes() {
        byte[] result = pdfGenerator.generateStudentReport(sampleStudent);

        // PDF files start with %PDF
        assertEquals('%', (char) result[0]);
        assertEquals('P', (char) result[1]);
        assertEquals('D', (char) result[2]);
        assertEquals('F', (char) result[3]);
    }

    @Test
    void generateStudentReport_shouldHandleNullOptionalFields() {
        sampleStudent.setPhone(null);
        sampleStudent.setAddress(null);
        sampleStudent.setClassInfo(null);
        sampleStudent.setSection(null);

        assertDoesNotThrow(() -> pdfGenerator.generateStudentReport(sampleStudent));
    }
}
