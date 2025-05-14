"use client";

import React, { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "../../../../components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CoverLetterPreview = ({ content, title = "Cover Letter" }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Dynamically import jsPDF to avoid SSR issues
      const { default: jsPDF } = await import('jspdf');

      // Create a new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set font
      doc.setFont('helvetica');

      // Parse markdown content
      const lines = content.split('\n');

      let y = 20; // Starting y position
      const margin = 20;
      const pageWidth = 210; // A4 width in mm
      const textWidth = pageWidth - (margin * 2);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('# ')) {
          // Main heading
          doc.setFontSize(24);
          doc.setFont('helvetica', 'bold');
          doc.text(line.substring(2), margin, y);
          y += 10;
        } else if (line.startsWith('## ')) {
          // Section heading
          doc.setFontSize(18);
          doc.setFont('helvetica', 'bold');
          doc.text(line.substring(3), margin, y);
          y += 8;
        } else if (line.startsWith('### ')) {
          // Subsection heading
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(line.substring(4), margin, y);
          y += 6;
        } else if (line.startsWith('* ')) {
          // Bullet point
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          doc.text('• ' + line.substring(2), margin + 5, y);
          y += 6;
        } else if (line.length > 0) {
          // Regular text
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');

          // Handle text wrapping
          const textLines = doc.splitTextToSize(line, textWidth);
          doc.text(textLines, margin, y);
          y += 6 * textLines.length;
        } else {
          // Empty line
          y += 4;
        }

        // Check if we need a new page
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      }

      // Save the PDF with a formatted filename
      const filename = title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '') + '-cover-letter.pdf';
      doc.save(filename);

      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="py-4 space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={generatePDF}
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download PDF
            </>
          )}
        </Button>
      </div>
      <MDEditor value={content} preview="preview" height={700} />
    </div>
  );
};

export default CoverLetterPreview;