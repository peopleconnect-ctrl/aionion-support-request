import frappe
from frappe.model.document import Document

class SupportRequest(Document):
    def before_insert(self):
        """
        Auto-assign reporting manager based on employee hierarchy before saving.
        """
        if self.email and not self.approver_email:
            # Look up Employee record linked to the requester email
            employee = frappe.db.get_value(
                "Employee",
                {"company_email": self.email},
                ["name", "reports_to", "department"],
                as_dict=True
            )
            
            if employee and employee.reports_to:
                # Fetch Manager details
                manager = frappe.db.get_value(
                    "Employee",
                    {"name": employee.reports_to},
                    ["employee_name", "company_email", "department"],
                    as_dict=True
                )
                if manager:
                    self.approver_name = manager.employee_name
                    self.approver_email = manager.company_email
                    self.approver_department = manager.department

    def on_submit(self):
        """
        Trigger email notification to direct manager upon submission.
        """
        if self.approver_email:
            subject = f"Support Request Approval Required: {self.reference_id} - {self.full_name}"
            message = f"""
            <p>Dear {self.approver_name or 'Manager'},</p>
            <p>A new support request requires your review and approval:</p>
            <ul>
                <li><b>Reference ID:</b> {self.reference_id}</li>
                <li><b>Requester:</b> {self.full_name} ({self.department})</li>
                <li><b>Category:</b> {self.request_category}</li>
                <li><b>Purpose:</b> {self.purpose_of_request}</li>
                <li><b>Required By:</b> {self.required_by}</li>
            </ul>
            <p>Please log into the support portal or reply to approve this request.</p>
            """
            frappe.sendmail(recipients=[self.approver_email], subject=subject, message=message)

@frappe.whitelist()
def get_user_department_requests(user_email=None):
    """
    Whitelisted API endpoint for Team Admin view.
    Returns requests filtered by department based on logged-in user role.
    """
    if not user_email:
        user_email = frappe.session.user

    # Fetch user department
    user_dept = frappe.db.get_value("Employee", {"user_id": user_email}, "department")
    
    if frappe.session.user == "Administrator" or "System Manager" in frappe.get_roles():
        return frappe.get_all("Support Request", fields=["*"], order_by="creation desc")
    
    if user_dept:
        return frappe.get_all("Support Request", filters={"department": user_dept}, fields=["*"], order_by="creation desc")
    
    return frappe.get_all("Support Request", filters={"owner": user_email}, fields=["*"], order_by="creation desc")
