/**
 * GOOGLE APPS SCRIPT FOR AIONION SUPPORT REQUESTS
 * ========================================================
 * 1. Open a Google Sheet at https://sheets.google.com
 * 2. Click Extensions > Apps Script
 * 3. Replace all code in Code.gs with this entire script
 * 4. Click Deploy > New deployment > Select type: Web app
 * 5. Set 'Execute as': Me
 * 6. Set 'Who has access': Anyone
 * 7. Click Deploy, authorize permissions, and copy the Web App URL!
 * ========================================================
 */

function testEmailAndSheet() {
  var testData = {
    reference_id: "TEST-REQ-1001",
    full_name: "Test Requester",
    employee_code: "AION-101",
    department: "Corporate Communications",
    email: "peopleconnect@aionioncapital.com",
    contact_number: "+91 9876543210",
    branch_location: "Chennai",
    request_category: "Visiting card",
    target_audience: "Internal Employees",
    purpose_of_request: "Testing automated email and Google Sheet logging",
    required_by: "2026-07-30",
    priority_level: "Normal",
    approver_name: "Naveen Kumar",
    approver_email: "naveenkumar.k@aionioncapital.com",
    approver_department: "Management",
    status: "Pending",
    created_at: new Date().toISOString()
  };
  
  var e = { postData: { contents: JSON.stringify(testData) } };
  var response = doPost(e);
  Logger.log("Test execution result: " + response.getContent());
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // 1. Get or Create Sheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Support Requests");
    if (!sheet) {
      sheet = ss.insertSheet("Support Requests");
      // Add Headers row
      sheet.appendRow([
        "Reference ID",
        "Submitted Date",
        "Full Name",
        "Employee Code",
        "Department",
        "Official Email",
        "Contact Number",
        "Branch Location",
        "Request Category",
        "Target Audience",
        "Purpose of Request",
        "Required By",
        "Priority Level",
        "Approver Name",
        "Approver Email",
        "Approver Department",
        "Status"
      ]);
      // Format header row
      sheet.getRange(1, 1, 1, 17).setFontWeight("bold").setBackground("#0038FF").setFontColor("#FFFFFF");
    }

    // 2. Format Timestamp
    var timestamp = data.created_at ? new Date(data.created_at).toLocaleString('en-GB') : new Date().toLocaleString('en-GB');

    // 3. Append Row to Google Sheet
    sheet.appendRow([
      data.reference_id || "",
      timestamp,
      data.full_name || "",
      data.employee_code || "N/A",
      data.department || "",
      data.email || "",
      data.contact_number || "",
      data.branch_location || "",
      data.request_category || "",
      data.target_audience || "N/A",
      data.purpose_of_request || "",
      data.required_by || "",
      data.priority_level || "Normal",
      data.approver_name || "",
      data.approver_email || "",
      data.approver_department || "",
      data.status || "Pending"
    ]);

    // 4. Send Team Notification Email
    sendTeamEmail(data);

    // 5. Send Requester Confirmation Email
    sendRequesterEmail(data);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", reference_id: data.reference_id }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper: Send Team Notification Email
function sendTeamEmail(data) {
  var teamEmail = "peopleconnect@aionioncapital.com";
  var ccEmails = "naveenkumar.k@aionioncapital.com,balakumar.elango@aionioncapital.com";
  var subject = "[" + (data.reference_id || "NEW") + "] Support Request - " + (data.request_category || "General") + " (" + (data.full_name || "") + ")";
  
  var htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #0038FF; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 20px;">New Support Request Received</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Reference ID: <strong>${data.reference_id}</strong></p>
      </div>
      
      <div style="padding: 20px; color: #1e293b; line-height: 1.6;">
        <h3 style="color: #0038FF; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 0;">👤 Requester Details</h3>
        <table style="width: 100%; font-size: 14px; margin-bottom: 16px;">
          <tr><td style="width: 35%; color: #64748b;">Full Name:</td><td><strong>${data.full_name}</strong></td></tr>
          <tr><td style="color: #64748b;">Employee Code:</td><td>${data.employee_code || 'N/A'}</td></tr>
          <tr><td style="color: #64748b;">Department:</td><td>${data.department}</td></tr>
          <tr><td style="color: #64748b;">Email:</td><td><a href="mailto:${data.email}">${data.email}</a></td></tr>
          <tr><td style="color: #64748b;">Contact:</td><td>${data.contact_number}</td></tr>
          <tr><td style="color: #64748b;">Branch:</td><td>${data.branch_location}</td></tr>
        </table>

        <h3 style="color: #0038FF; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">📋 Request Details</h3>
        <table style="width: 100%; font-size: 14px; margin-bottom: 16px;">
          <tr><td style="width: 35%; color: #64748b;">Category:</td><td><strong>${data.request_category}</strong></td></tr>
          <tr><td style="color: #64748b;">Target Audience:</td><td>${data.targetAudience || 'N/A'}</td></tr>
          <tr><td style="color: #64748b;">Purpose:</td><td>${data.purpose_of_request}</td></tr>
          <tr><td style="color: #64748b;">Required By:</td><td><span style="color: #dc2626; font-weight: bold;">${data.required_by}</span></td></tr>
          <tr><td style="color: #64748b;">Priority Level:</td><td><span style="background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${data.priority_level}</span></td></tr>
        </table>

        <h3 style="color: #0038FF; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">✅ Approval Info</h3>
        <table style="width: 100%; font-size: 14px; margin-bottom: 20px;">
          <tr><td style="width: 35%; color: #64748b;">Approver Name:</td><td>${data.approver_name} (${data.approver_department})</td></tr>
          <tr><td style="color: #64748b;">Approver Email:</td><td>${data.approver_email}</td></tr>
        </table>

        <div style="text-align: center; margin-top: 25px;">
          <a href="https://aionion-support-request.vercel.app/admin" style="background: #0038FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Open Admin Dashboard</a>
        </div>
      </div>
      
      <div style="background: #f8fafc; padding: 12px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        Automated Notification • Aionion Capital Support Portal
      </div>
    </div>
  `;

  try {
    MailApp.sendEmail({
      to: teamEmail,
      cc: ccEmails,
      subject: subject,
      htmlBody: htmlBody
    });
  } catch (err) {
    console.error("Team email sending error:", err);
  }
}

// Helper: Send Requester Confirmation Email
function sendRequesterEmail(data) {
  if (!data.email) return;

  var subject = "Request Confirmation [" + data.reference_id + "] - Aionion Capital Support Portal";
  
  var htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #10B981; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 20px;">Request Received Successfully!</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Reference ID: <strong>${data.reference_id}</strong></p>
      </div>
      
      <div style="padding: 20px; color: #1e293b; line-height: 1.6;">
        <p>Dear <strong>${data.full_name}</strong>,</p>
        
        <p>Thank you for submitting your corporate communication & support request. Our team has received your details and registered your request under Reference ID <strong>${data.reference_id}</strong>.</p>
        
        <div style="background: #f8fafc; border-left: 4px solid #10B981; padding: 14px; margin: 20px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 8px 0; color: #0f766e;">Summary of your request:</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #334155;">
            <li><strong>Category:</strong> ${data.request_category}</li>
            <li><strong>Required By:</strong> ${data.required_by}</li>
            <li><strong>Priority Level:</strong> ${data.priority_level}</li>
            <li><strong>Approver:</strong> ${data.approver_name} (${data.approver_email})</li>
          </ul>
        </div>

        <p>Our Corporate Communications & Support team is currently reviewing your requirement and will deliver it on or before <strong>${data.required_by}</strong>.</p>
        
        <p style="color: #64748b; font-size: 13px;">If you have any urgent queries or updates regarding this request, please reply to this email or contact <a href="mailto:peopleconnect@aionioncapital.com">peopleconnect@aionioncapital.com</a> quoting your Reference ID <strong>${data.reference_id}</strong>.</p>
        
        <br/>
        <p style="margin-bottom: 0;">Warm regards,<br/><strong>Corporate Communications & Support Team</strong><br/>Aionion Capital</p>
      </div>
      
      <div style="background: #f8fafc; padding: 12px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        Automated Acknowledgement • Aionion Capital Support Portal
      </div>
    </div>
  `;

  try {
    MailApp.sendEmail({
      to: data.email,
      subject: subject,
      htmlBody: htmlBody
    });
  } catch (err) {
    console.error("Requester email sending error:", err);
  }
}
