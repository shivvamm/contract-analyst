import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { writeFileSync } from "fs";

const PAGES = 12;

const CONTRACT_SECTIONS = [
  {
    title: "SOFTWARE SERVICES AGREEMENT",
    body: `This Software Services Agreement ("Agreement") is entered into as of January 1, 2025, by and between Beechwood Technologies Inc., a Delaware corporation ("Service Provider"), with its principal place of business at 123 Innovation Drive, San Francisco, CA 94105, and Maplestone Solutions LLC, a New York limited liability company ("Client"), with its principal place of business at 456 Commerce Avenue, New York, NY 10001.

RECITALS

WHEREAS, Service Provider is in the business of developing and providing software solutions and related services; and

WHEREAS, Client desires to engage Service Provider to provide certain software development and maintenance services; and

WHEREAS, both parties desire to set forth the terms and conditions governing such engagement;

NOW, THEREFORE, in consideration of the mutual covenants and agreements hereinafter set forth, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:`,
  },
  {
    title: "ARTICLE 1: DEFINITIONS",
    body: `1.1 "Deliverables" means all work product, software code, documentation, reports, and other materials created by Service Provider in connection with the Services, as further described in each Statement of Work.

1.2 "Intellectual Property Rights" means all patents, copyrights, trademarks, trade secrets, moral rights, and any other intellectual or industrial property rights of any kind, whether registered or unregistered, including all applications and rights to apply for registration.

1.3 "Services" means the software development, maintenance, consulting, and related services to be performed by Service Provider as described in each Statement of Work attached hereto.

1.4 "Statement of Work" or "SOW" means a written document executed by both parties describing specific Services to be provided, the applicable fees, timeline, and deliverables.

1.5 "Confidential Information" means any non-public, proprietary, or confidential information disclosed by one party to the other, whether orally or in writing, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure.

1.6 "Effective Date" means the date first written above on which this Agreement becomes effective upon execution by both parties.`,
  },
  {
    title: "ARTICLE 2: SERVICES AND DELIVERABLES",
    body: `2.1 Scope of Services. Service Provider shall perform the Services described in each SOW executed by the parties. Each SOW shall be incorporated into and made a part of this Agreement. In the event of any conflict between the terms of this Agreement and any SOW, the terms of the SOW shall control with respect to the subject matter of that SOW only.

2.2 Change Orders. Any changes to the scope of Services described in an SOW must be agreed upon in writing by both parties through a Change Order. A Change Order shall describe the change in scope, any adjustment to fees, and any adjustment to the timeline.

2.3 Subcontractors. Service Provider may engage subcontractors to assist in performing the Services, provided that Service Provider shall remain responsible for all Services performed by subcontractors and shall ensure that subcontractors are bound by confidentiality obligations no less restrictive than those set forth in this Agreement.

2.4 Client Cooperation. Client shall provide Service Provider with reasonable cooperation and access to information, systems, and personnel as required for Service Provider to perform the Services. Client acknowledges that Service Provider's ability to perform the Services may depend on Client's timely cooperation and provision of required materials.`,
  },
  {
    title: "ARTICLE 3: FEES AND PAYMENT",
    body: `3.1 Fees. Client shall pay Service Provider the fees set forth in each SOW. Unless otherwise specified in the applicable SOW, Service Provider shall invoice Client monthly for Services rendered during the preceding month.

3.2 Payment Terms. All invoices are due and payable within thirty (30) days of the invoice date. Client shall make payments in U.S. dollars via wire transfer, ACH, or such other method as agreed by the parties in writing.

3.3 Late Payments. Any amounts not paid by Client when due shall accrue interest at the rate of one and one-half percent (1.5%) per month, or the maximum rate permitted by law, whichever is less, calculated from the due date until the date of actual payment.

3.4 Taxes. All fees are exclusive of applicable taxes. Client shall be responsible for all sales, use, value-added, and other similar taxes imposed on the Services, excluding taxes based on Service Provider's net income.

3.5 Expense Reimbursement. Client shall reimburse Service Provider for all pre-approved, reasonable out-of-pocket expenses incurred in connection with the Services, including travel, lodging, and materials. Service Provider shall provide receipts for all expenses exceeding $50.00.`,
  },
  {
    title: "ARTICLE 4: INTELLECTUAL PROPERTY",
    body: `4.1 Work for Hire. Subject to full payment of all fees, all Deliverables created by Service Provider specifically for Client under this Agreement shall be considered works made for hire to the maximum extent permitted by applicable law and shall be the exclusive property of Client.

4.2 Assignment. To the extent that any Deliverables do not qualify as works made for hire, Service Provider hereby irrevocably assigns to Client all right, title, and interest in and to such Deliverables, including all Intellectual Property Rights therein.

4.3 Pre-Existing IP. Service Provider retains all ownership rights in any pre-existing intellectual property, tools, methodologies, frameworks, and libraries developed by Service Provider prior to or independently of this Agreement ("Background IP"). Service Provider grants Client a non-exclusive, royalty-free, perpetual license to use Background IP solely to the extent incorporated in the Deliverables.

4.4 Client IP. Client retains all ownership rights in any materials, data, or information provided by Client to Service Provider in connection with the Services ("Client IP"). Client grants Service Provider a limited, non-exclusive license to use Client IP solely for the purpose of performing the Services.`,
  },
  {
    title: "ARTICLE 5: CONFIDENTIALITY",
    body: `5.1 Obligations. Each party (as "Receiving Party") agrees to hold in strict confidence the Confidential Information of the other party (as "Disclosing Party") and to use such Confidential Information solely for the purpose of performing its obligations or exercising its rights under this Agreement.

5.2 Standard of Care. Each Receiving Party shall protect the Confidential Information of the Disclosing Party using at least the same degree of care it uses to protect its own confidential information, but in no event less than reasonable care.

5.3 Exclusions. Confidentiality obligations shall not apply to information that: (a) is or becomes publicly available through no fault of the Receiving Party; (b) was rightfully known to the Receiving Party without restriction prior to disclosure; (c) is rightfully obtained by the Receiving Party from a third party without restriction; or (d) is independently developed by the Receiving Party without use of or reference to the Disclosing Party's Confidential Information.

5.4 Compelled Disclosure. If the Receiving Party is required by law, regulation, or court order to disclose Confidential Information, the Receiving Party shall, to the extent permitted by law, provide the Disclosing Party with prompt written notice and cooperate with the Disclosing Party's efforts to obtain a protective order.

5.5 Duration. The obligations of this Article 5 shall survive for a period of five (5) years following the termination or expiration of this Agreement.`,
  },
  {
    title: "ARTICLE 6: WARRANTIES AND REPRESENTATIONS",
    body: `6.1 Service Provider Warranties. Service Provider represents and warrants that: (a) it has the full right, power, and authority to enter into and perform this Agreement; (b) the Services will be performed in a professional and workmanlike manner by qualified personnel; (c) the Deliverables will conform in all material respects to the specifications set forth in the applicable SOW for a period of ninety (90) days following delivery; and (d) the Deliverables will not infringe any third-party Intellectual Property Rights.

6.2 Client Warranties. Client represents and warrants that: (a) it has the full right, power, and authority to enter into and perform this Agreement; (b) it has all necessary rights to provide Client IP to Service Provider; and (c) its use of the Services and Deliverables shall comply with all applicable laws and regulations.

6.3 Warranty Remedy. If any Deliverable fails to conform to the warranties set forth in Section 6.1(c), Service Provider shall, at its option, repair or replace the non-conforming Deliverable or refund the fees paid for such Deliverable, provided that Client notifies Service Provider in writing of the non-conformity within the warranty period.

6.4 Disclaimer. EXCEPT AS EXPRESSLY SET FORTH IN THIS AGREEMENT, NEITHER PARTY MAKES ANY WARRANTIES, EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.`,
  },
  {
    title: "ARTICLE 7: LIMITATION OF LIABILITY AND INDEMNIFICATION",
    body: `7.1 Limitation of Liability. IN NO EVENT SHALL EITHER PARTY BE LIABLE TO THE OTHER FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, LOSS OF BUSINESS, OR LOSS OF DATA, ARISING OUT OF OR IN CONNECTION WITH THIS AGREEMENT, EVEN IF SUCH PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

7.2 Cap on Liability. EACH PARTY'S TOTAL CUMULATIVE LIABILITY ARISING OUT OF OR IN CONNECTION WITH THIS AGREEMENT SHALL NOT EXCEED THE TOTAL FEES PAID OR PAYABLE BY CLIENT TO SERVICE PROVIDER IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM GIVING RISE TO LIABILITY.

7.3 Indemnification by Service Provider. Service Provider shall indemnify, defend, and hold harmless Client and its officers, directors, employees, and agents from and against any claims, damages, losses, and expenses (including reasonable attorneys' fees) arising out of or relating to: (a) Service Provider's material breach of this Agreement; (b) any third-party claim that the Deliverables infringe such third party's Intellectual Property Rights; or (c) the gross negligence or willful misconduct of Service Provider.

7.4 Indemnification by Client. Client shall indemnify, defend, and hold harmless Service Provider and its officers, directors, employees, and agents from and against any claims, damages, losses, and expenses (including reasonable attorneys' fees) arising out of or relating to: (a) Client's material breach of this Agreement; (b) any third-party claim arising from Client's use of the Deliverables in violation of applicable law; or (c) the gross negligence or willful misconduct of Client.`,
  },
  {
    title: "ARTICLE 8: TERM AND TERMINATION",
    body: `8.1 Term. This Agreement shall commence on the Effective Date and shall continue for an initial term of two (2) years, unless earlier terminated as provided herein ("Initial Term"). After the Initial Term, this Agreement shall automatically renew for successive one-year terms unless either party provides written notice of non-renewal at least sixty (60) days prior to the end of the then-current term.

8.2 Termination for Cause. Either party may terminate this Agreement immediately upon written notice if the other party: (a) materially breaches this Agreement and fails to cure such breach within thirty (30) days after receiving written notice of the breach; (b) becomes insolvent, makes an assignment for the benefit of creditors, or becomes subject to bankruptcy or similar proceedings; or (c) ceases to conduct business in the ordinary course.

8.3 Termination for Convenience. Either party may terminate this Agreement for convenience upon sixty (60) days prior written notice to the other party. In the event of termination for convenience by Client, Client shall pay Service Provider for all Services rendered through the effective date of termination.

8.4 Effects of Termination. Upon expiration or termination of this Agreement: (a) each party shall promptly return or destroy the Confidential Information of the other party; (b) all outstanding payment obligations of Client shall become immediately due and payable; and (c) provisions that by their nature should survive termination shall so survive.`,
  },
  {
    title: "ARTICLE 9: GENERAL PROVISIONS",
    body: `9.1 Governing Law. This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of laws principles.

9.2 Dispute Resolution. Any dispute arising out of or relating to this Agreement shall first be subject to good-faith negotiation between senior representatives of the parties for a period of thirty (30) days. If the dispute is not resolved through negotiation, it shall be submitted to binding arbitration administered by JAMS under its Commercial Arbitration Rules. The arbitration shall be conducted in San Francisco, California, and the award shall be final and binding.

9.3 Entire Agreement. This Agreement, together with all SOWs and any amendments executed by the parties, constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior and contemporaneous agreements, representations, and understandings.

9.4 Amendments. No amendment or modification of this Agreement shall be valid or binding unless made in writing and duly executed by authorized representatives of both parties.

9.5 Waiver. No waiver of any provision of this Agreement shall be effective unless made in writing. No waiver shall be deemed a continuing waiver or a waiver of any other provision.

9.6 Severability. If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.`,
  },
  {
    title: "ARTICLE 10: NOTICES AND ASSIGNMENTS",
    body: `10.1 Notices. All notices under this Agreement shall be in writing and delivered by: (a) personal delivery; (b) certified mail, return receipt requested; (c) nationally recognized overnight courier; or (d) email with confirmation of receipt. Notices to Service Provider shall be sent to: Legal Department, Beechwood Technologies Inc., 123 Innovation Drive, San Francisco, CA 94105, legal@beechwoodtech.com. Notices to Client shall be sent to: General Counsel, Maplestone Solutions LLC, 456 Commerce Avenue, New York, NY 10001, legal@maplestonesolutions.com.

10.2 Assignment. Neither party may assign this Agreement or any rights hereunder without the prior written consent of the other party, except that either party may assign this Agreement without consent in connection with a merger, acquisition, or sale of all or substantially all of its assets. Any purported assignment in violation of this Section shall be void.

10.3 Force Majeure. Neither party shall be liable for any failure or delay in performance due to causes beyond its reasonable control, including acts of God, natural disasters, war, terrorism, labor disputes, or governmental actions, provided that the affected party promptly notifies the other party and uses commercially reasonable efforts to resume performance.

10.4 Independent Contractors. The parties are independent contractors. Nothing in this Agreement shall be construed to create a partnership, joint venture, agency, employment, or franchise relationship between the parties.

10.5 Counterparts. This Agreement may be executed in counterparts, each of which shall be deemed an original, and all of which together shall constitute one and the same instrument. Electronic signatures shall be deemed valid and binding.`,
  },
  {
    title: "EXHIBIT A: STATEMENT OF WORK NO. 1 & SIGNATURES",
    body: `EXHIBIT A — STATEMENT OF WORK NO. 1

Project Name: Contract Management Platform — Phase 1
Project Duration: January 1, 2025 through June 30, 2025
Total Fixed Fee: $180,000 USD

Scope of Work:
1. Discovery & Requirements (Weeks 1–3): Stakeholder interviews, requirements documentation, technical architecture design.
2. Backend Development (Weeks 4–12): API design, database schema, authentication module, core contract processing engine.
3. Frontend Development (Weeks 8–18): Dashboard UI, document upload interface, analytics views, user management.
4. Integration & Testing (Weeks 16–22): Third-party integrations (DocuSign, Salesforce), QA testing, performance tuning.
5. Deployment & Handover (Weeks 22–24): Production deployment, documentation, team training, 30-day hypercare support.

Payment Schedule:
- 25% upon SOW execution: $45,000
- 25% upon completion of Backend Development milestone: $45,000
- 25% upon completion of Integration & Testing milestone: $45,000
- 25% upon final delivery and acceptance: $45,000

SIGNATURES

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

BEECHWOOD TECHNOLOGIES INC.

By: ___________________________
Name: Jonathan R. Whitfield
Title: Chief Executive Officer
Date: January 1, 2025

MAPLESTONE SOLUTIONS LLC

By: ___________________________
Name: Priya K. Sharma
Title: Chief Operating Officer
Date: January 1, 2025`,
  },
];

async function generatePdf() {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 72;
  const contentWidth = pageWidth - margin * 2;

  function wrapText(text, maxWidth, fontSize, f) {
    const words = text.replace(/\n/g, " ").split(" ");
    const lines = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = f.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  for (let p = 0; p < PAGES; p++) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const section = CONTRACT_SECTIONS[p];
    let y = pageHeight - margin;

    // Page header
    page.drawText("SOFTWARE SERVICES AGREEMENT — CONFIDENTIAL", {
      x: margin,
      y: pageHeight - 40,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawLine({
      start: { x: margin, y: pageHeight - 50 },
      end: { x: pageWidth - margin, y: pageHeight - 50 },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });

    y = pageHeight - 75;

    // Section title
    const titleLines = wrapText(section.title, contentWidth, 13, boldFont);
    for (const line of titleLines) {
      page.drawText(line, {
        x: margin,
        y,
        size: 13,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= 18;
    }
    y -= 8;

    // Body text
    const paragraphs = section.body.split("\n\n");
    for (const para of paragraphs) {
      if (y < margin + 60) break;
      const trimmed = para.trim();
      if (!trimmed) continue;

      const lines = wrapText(trimmed, contentWidth, 10.5, font);
      for (const line of lines) {
        if (y < margin + 40) break;
        page.drawText(line, {
          x: margin,
          y,
          size: 10.5,
          font,
          color: rgb(0.15, 0.15, 0.15),
        });
        y -= 15;
      }
      y -= 8;
    }

    // Page footer
    page.drawLine({
      start: { x: margin, y: margin - 10 },
      end: { x: pageWidth - margin, y: margin - 10 },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });

    page.drawText(`Page ${p + 1} of ${PAGES}`, {
      x: pageWidth / 2 - 25,
      y: margin - 24,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText("Beechwood Technologies Inc. & Maplestone Solutions LLC", {
      x: margin,
      y: margin - 24,
      size: 8,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  const pdfBytes = await pdfDoc.save();
  writeFileSync("public/sample-contract-12pages.pdf", pdfBytes);
  console.log("Generated: public/sample-contract-12pages.pdf");
  console.log(`Pages: ${pdfDoc.getPageCount()}`);
}

generatePdf().catch(console.error);
