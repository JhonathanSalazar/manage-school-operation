package com.school.report.pdf;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.school.report.dto.StudentDto;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class PdfGenerator {

    public byte[] generateStudentReport(StudentDto student) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (PdfWriter writer = new PdfWriter(out);
             PdfDocument pdfDoc = new PdfDocument(writer);
             Document document = new Document(pdfDoc, PageSize.A4)) {

            document.setMargins(40, 40, 40, 40);

            // Header
            document.add(new Paragraph("School Management System")
                    .setFontSize(20)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ColorConstants.DARK_GRAY));

            document.add(new Paragraph("Student Profile Report")
                    .setFontSize(14)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ColorConstants.GRAY));

            document.add(new Paragraph("\n"));

            // Student info table
            Table table = new Table(UnitValue.createPercentArray(new float[]{35, 65}))
                    .setWidth(UnitValue.createPercentValue(100));

            addRow(table, "Student Code", student.getStudentCode());
            addRow(table, "Full Name", student.getFullName());
            addRow(table, "Email", student.getEmail());
            addRow(table, "Date of Birth", student.getDateOfBirth());
            addRow(table, "Gender", student.getGender());
            addRow(table, "Phone", student.getPhone());
            addRow(table, "Address", student.getAddress());

            if (student.getClassInfo() != null) {
                addRow(table, "Class", student.getClassInfo().getName());
            }
            if (student.getSection() != null) {
                addRow(table, "Section", student.getSection().getName());
            }
            addRow(table, "Roll Number", student.getRollNumber());

            document.add(table);

            document.add(new Paragraph("\n"));

            // Guardian info
            document.add(new Paragraph("Guardian Information")
                    .setFontSize(12)
                    .setBold()
                    .setFontColor(ColorConstants.DARK_GRAY));

            Table guardianTable = new Table(UnitValue.createPercentArray(new float[]{35, 65}))
                    .setWidth(UnitValue.createPercentValue(100));

            addRow(guardianTable, "Guardian Name", student.getGuardianName());
            addRow(guardianTable, "Guardian Phone", student.getGuardianPhone());

            document.add(guardianTable);

            // Footer
            document.add(new Paragraph("\n\nGenerated on: " +
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                    .setFontSize(8)
                    .setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.RIGHT));
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF for student: " + student.getId(), e);
        }

        return out.toByteArray();
    }

    private void addRow(Table table, String label, String value) {
        table.addCell(new Cell()
                .add(new Paragraph(label).setBold().setFontSize(10))
                .setBackgroundColor(ColorConstants.LIGHT_GRAY));
        table.addCell(new Cell()
                .add(new Paragraph(value != null ? value : "-").setFontSize(10)));
    }
}
