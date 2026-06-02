import { useState, useMemo } from 'react';
// Make sure these imports match the paths in your generated folder!
import { Wtw_skilllibrariesService } from '../generated/services/Wtw_skilllibrariesService';
import { Wtw_colleagueprofilesService } from '../generated/services/Wtw_colleagueprofilesService';
import { Wtw_skillassessmentsService } from '../generated/services/Wtw_skillassessmentsService';

// Keep your massive SAMPLES array right here!
const SAMPLES = [
    {
        name: "Jyrho Alberto",
        role: "BA",
        matrix: {
            "Eligibility": "Experience",
            "30-Hour calc": "Exposure",
            "Non-standard benefits": "Experience",
            "Pre-65 Retirees": "Experience",
            "Post-65 Retirees": "Experience",
            "Loading Rates": "Exposure",
            "LTD": "Experience",
            "STD": "Experience",
            "EOI calc": "Expert",
            "EOI Decision File": "Expert",
            "Events": "Expert",
            "AE Live Date": "Potential",
            "Mid-Year Live Date": "Potential",
            "WTW Standard Conversion Layouts": "Potential",
            "Data Dump Conversion Layout": "Potential",
            "Hours Conversion": "Potential",
            "901 Analysis": "Potential",
            "WTW Multi-file layout": "Potential",
            "WTW Single-file layout": "Potential",
            "Non-WTW file layout": "Potential",
            "Hours import": "Potential",
            "HSA status": "Potential",
            "Image import": "Potential",
            "Validations": "Potential",
            "ESS Next": "Consulting",
            "Non- ESS Next": "Experience",
            "SSO In": "Experience",
            "SSO Out": "Experience",
            "ESS Customization": "Expert",
            "Embark Integration": "Exposure",
            "Web Admin": "Exposure",
            "Plan Sponsor": "Exposure",
            "Communication Triggers": "Expert",
            "Print Communications": "Expert",
            "Email Communications": "Expert",
            "Text Communications": "Expert",
            "Custom Communications": "Expert",
            "SSRS Reports": "Expert",
            "Batch Reporting": "Expert",
            "Izenda": "Exposure",
            "Custom Reporting": "Expert",
            "WTW COBRA": "Exposure",
            "Non-WTW COBRA": "Exposure",
            "Direct Billing": "Potential",
            "WTW Benefit Accounts": "Potential",
            "Non-WTW Accounts": "Potential",
            "Event Verification": "Potential",
            "Dependent Verification": "Expert",
            "HCR Reporting": "Potential",
            "Carriers": "Potential",
            "Port & Convert": "Potential",
            "Premium Reporting": "Potential",
            "Vendor Payment": "Potential",
            "Non-WTW Verification": "Potential",
            "APIs": "Potential",
            "TDS Payroll": "Potential",
            "Closed Loop Payroll": "Potential",
            "TDS Billing Integration": "Potential",
            "Passthrough": "Potential",
            "Simon Procedures": "N/A",
            "Admin Guide": "Experience",
            "Overage": "Experience",
            "Age 65": "Experience",
            "Custom Processes": "N/A",
            "SFTP Setup": "Potential",
            "Calc": "Potential",
            "Export": "Potential",
            "Data Reconciliation": "Potential",
            "HRDQs": "Potential",
            "ATT (SQL)": "Potential",
            "ATT (Action Based)": "N/A",
            "File Automation": "Potential",
            "CDQ": "N/A"
        }
    },
    {
        name: "Shari Andres",
        role: "BA",
        matrix: {
            "Eligibility": "Expert",
            "30-Hour calc": "Exposure",
            "Non-standard benefits": "Expert",
            "Pre-65 Retirees": "Expert",
            "Post-65 Retirees": "Expert",
            "Loading Rates": "Exposure",
            "LTD": "Expert",
            "STD": "Expert",
            "EOI calc": "Expert",
            "EOI Decision File": "Expert",
            "Events": "Expert",
            "AE Live Date": "Potential",
            "Mid-Year Live Date": "Potential",
            "WTW Standard Conversion Layouts": "Experience",
            "Data Dump Conversion Layout": "Potential",
            "Hours Conversion": "Potential",
            "901 Analysis": "Potential",
            "WTW Multi-file layout": "Experience",
            "WTW Single-file layout": "Experience",
            "Non-WTW file layout": "Experience",
            "Hours import": "Potential",
            "HSA status": "Exposure",
            "Image import": "Potential",
            "Validations": "Experience",
            "ESS Next": "Consulting",
            "Non- ESS Next": "Consulting",
            "SSO In": "Experience",
            "SSO Out": "Experience",
            "ESS Customization": "Expert",
            "Embark Integration": "Exposure",
            "Web Admin": "Exposure",
            "Plan Sponsor": "Exposure",
            "Communication Triggers": "Consulting",
            "Print Communications": "Consulting",
            "Email Communications": "Consulting",
            "Text Communications": "Consulting",
            "Custom Communications": "Consulting",
            "SSRS Reports": "Expert",
            "Batch Reporting": "Expert",
            "Izenda": "Exposure",
            "Custom Reporting": "Expert",
            "WTW COBRA": "Expert",
            "Non-WTW COBRA": "Expert",
            "Direct Billing": "Potential",
            "WTW Benefit Accounts": "Exposure",
            "Non-WTW Accounts": "Exposure",
            "Event Verification": "Exposure",
            "Dependent Verification": "Expert",
            "HCR Reporting": "Potential",
            "Carriers": "Expert",
            "Port & Convert": "Expert",
            "Premium Reporting": "Experience",
            "Vendor Payment": "Potential",
            "Non-WTW Verification": "Potential",
            "APIs": "Potential",
            "TDS Payroll": "Potential",
            "Closed Loop Payroll": "Potential",
            "TDS Billing Integration": "Potential",
            "Passthrough": "Potential",
            "Simon Procedures": "Expert",
            "Admin Guide": "N/A",
            "Overage": "Experience",
            "Age 65": "Experience",
            "Custom Processes": "Experience",
            "SFTP Setup": "N/A",
            "Calc": "Potential",
            "Export": "Potential",
            "Data Reconciliation": "Potential",
            "HRDQs": "Exposure",
            "ATT (SQL)": "Potential",
            "ATT (Action Based)": "Potential",
            "File Automation": "N/A",
            "CDQ": "Exposure"
        }
    },
    {
        name: "Mark Louie Aranaido",
        role: "BA",
        matrix: {
            "Eligibility": "Potential",
            "30-Hour calc": "Potential",
            "Non-standard benefits": "Potential",
            "Pre-65 Retirees": "Potential",
            "Post-65 Retirees": "Potential",
            "Loading Rates": "Potential",
            "LTD": "Potential",
            "STD": "Potential",
            "EOI calc": "Potential",
            "EOI Decision File": "Potential",
            "Events": "Potential",
            "AE Live Date": "Potential",
            "Mid-Year Live Date": "Potential",
            "WTW Standard Conversion Layouts": "Potential",
            "Data Dump Conversion Layout": "Potential",
            "Hours Conversion": "Potential",
            "901 Analysis": "Potential",
            "WTW Multi-file layout": "Potential",
            "WTW Single-file layout": "Potential",
            "Non-WTW file layout": "Potential",
            "Hours import": "Potential",
            "HSA status": "Potential",
            "Image import": "Potential",
            "Validations": "Potential",
            "ESS Next": "Potential",
            "Non- ESS Next": "Exposure",
            "SSO In": "Exposure",
            "SSO Out": "Potential",
            "ESS Customization": "Potential",
            "Embark Integration": "Exposure",
            "Web Admin": "Potential",
            "Plan Sponsor": "Potential",
            "Communication Triggers": "Potential",
            "Print Communications": "Potential",
            "Email Communications": "Potential",
            "Text Communications": "Potential",
            "Custom Communications": "Potential",
            "SSRS Reports": "Potential",
            "Batch Reporting": "Potential",
            "Izenda": "Potential",
            "Custom Reporting": "Potential",
            "WTW COBRA": "Potential",
            "Non-WTW COBRA": "Potential",
            "Direct Billing": "Potential",
            "WTW Benefit Accounts": "Potential",
            "Non-WTW Accounts": "Potential",
            "Event Verification": "Potential",
            "Dependent Verification": "Potential",
            "HCR Reporting": "Potential",
            "Carriers": "Potential",
            "Port & Convert": "Potential",
            "Premium Reporting": "Potential",
            "Vendor Payment": "Potential",
            "Non-WTW Verification": "Potential",
            "APIs": "Potential",
            "TDS Payroll": "Potential",
            "Closed Loop Payroll": "Potential",
            "TDS Billing Integration": "Potential",
            "Passthrough": "Potential",
            "Simon Procedures": "N/A",
            "Admin Guide": "Potential",
            "Overage": "Potential",
            "Age 65": "Potential",
            "Custom Processes": "N/A",
            "SFTP Setup": "Potential",
            "Calc": "Potential",
            "Export": "Potential",
            "Data Reconciliation": "Potential",
            "HRDQs": "Potential",
            "ATT (SQL)": "Potential",
            "ATT (Action Based)": "N/A",
            "File Automation": "Potential",
            "CDQ": "N/A"
        }
    },
    {
        name: "Bert Beronia",
        role: "BA",
        matrix: {
            "Eligibility": "Experience",
            "30-Hour calc": "Exposure",
            "Non-standard benefits": "Experience",
            "Pre-65 Retirees": "Experience",
            "Post-65 Retirees": "Experience",
            "Loading Rates": "Exposure",
            "LTD": "Experience",
            "STD": "Experience",
            "EOI calc": "Experience",
            "EOI Decision File": "Experience",
            "Events": "Expert",
            "AE Live Date": "Potential",
            "Mid-Year Live Date": "Potential",
            "WTW Standard Conversion Layouts": "Potential",
            "Data Dump Conversion Layout": "Potential",
            "Hours Conversion": "Potential",
            "901 Analysis": "Potential",
            "WTW Multi-file layout": "Potential",
            "WTW Single-file layout": "Potential",
            "Non-WTW file layout": "Potential",
            "Hours import": "Potential",
            "HSA status": "Potential",
            "Image import": "Potential",
            "Validations": "Potential",
            "ESS Next": "Expert",
            "Non- ESS Next": "Exposure",
            "SSO In": "Exposure",
            "SSO Out": "Experience",
            "ESS Customization": "Expert",
            "Embark Integration": "Exposure",
            "Web Admin": "Exposure",
            "Plan Sponsor": "Experience",
            "Communication Triggers": "Expert",
            "Print Communications": "Expert",
            "Email Communications": "Expert",
            "Text Communications": "Expert",
            "Custom Communications": "Expert",
            "SSRS Reports": "Expert",
            "Batch Reporting": "Expert",
            "Izenda": "Exposure",
            "Custom Reporting": "Expert",
            "WTW COBRA": "Experience",
            "Non-WTW COBRA": "Exposure",
            "Direct Billing": "Potential",
            "WTW Benefit Accounts": "Potential",
            "Non-WTW Accounts": "Potential",
            "Event Verification": "Potential",
            "Dependent Verification": "Experience",
            "HCR Reporting": "Potential",
            "Carriers": "Experience",
            "Port & Convert": "Potential",
            "Premium Reporting": "Exposure",
            "Vendor Payment": "Potential",
            "Non-WTW Verification": "Potential",
            "APIs": "Potential",
            "TDS Payroll": "Potential",
            "Closed Loop Payroll": "Potential",
            "TDS Billing Integration": "Potential",
            "Passthrough": "Potential",
            "Simon Procedures": "N/A",
            "Admin Guide": "Exposure",
            "Overage": "Exposure",
            "Age 65": "Exposure",
            "Custom Processes": "N/A",
            "SFTP Setup": "Potential",
            "Calc": "Potential",
            "Export": "Potential",
            "Data Reconciliation": "Potential",
            "HRDQs": "Potential",
            "ATT (SQL)": "Potential",
            "ATT (Action Based)": "N/A",
            "File Automation": "Potential",
            "CDQ": "N/A"
        }
    },
    {
        name: "Kim Dolores",
        role: "BA",
        matrix: {
            "Eligibility": "Experience",
            "30-Hour calc": "Exposure",
            "Non-standard benefits": "Experience",
            "Pre-65 Retirees": "Experience",
            "Post-65 Retirees": "Experience",
            "Loading Rates": "Exposure",
            "LTD": "Experience",
            "STD": "Experience",
            "EOI calc": "Experience",
            "EOI Decision File": "Experience",
            "Events": "Expert",
            "AE Live Date": "Potential",
            "Mid-Year Live Date": "Potential",
            "WTW Standard Conversion Layouts": "Potential",
            "Data Dump Conversion Layout": "Potential",
            "Hours Conversion": "Potential",
            "901 Analysis": "Potential",
            "WTW Multi-file layout": "Potential",
            "WTW Single-file layout": "Potential",
            "Non-WTW file layout": "Potential",
            "Hours import": "Potential",
            "HSA status": "Potential",
            "Image import": "Potential",
            "Validations": "Potential",
            "ESS Next": "Expert",
            "Non- ESS Next": "Exposure",
            "SSO In": "Exposure",
            "SSO Out": "Experience",
            "ESS Customization": "Expert",
            "Embark Integration": "Exposure",
            "Web Admin": "Exposure",
            "Plan Sponsor": "Exposure",
            "Communication Triggers": "Expert",
            "Print Communications": "Expert",
            "Email Communications": "Expert",
            "Text Communications": "Expert",
            "Custom Communications": "Expert",
            "SSRS Reports": "Expert",
            "Batch Reporting": "Expert",
            "Izenda": "Exposure",
            "Custom Reporting": "Expert",
            "WTW COBRA": "Exposure",
            "Non-WTW COBRA": "Exposure",
            "Direct Billing": "Potential",
            "WTW Benefit Accounts": "Potential",
            "Non-WTW Accounts": "Potential",
            "Event Verification": "Potential",
            "Dependent Verification": "Experience",
            "HCR Reporting": "Potential",
            "Carriers": "Potential",
            "Port & Convert": "Potential",
            "Premium Reporting": "Potential",
            "Vendor Payment": "Potential",
            "Non-WTW Verification": "Potential",
            "APIs": "Potential",
            "TDS Payroll": "Potential",
            "Closed Loop Payroll": "Potential",
            "TDS Billing Integration": "Potential",
            "Passthrough": "Expert",
            "Simon Procedures": "N/A",
            "Admin Guide": "Exposure",
            "Overage": "Exposure",
            "Age 65": "Exposure",
            "Custom Processes": "N/A",
            "SFTP Setup": "Potential",
            "Calc": "Potential",
            "Export": "Potential",
            "Data Reconciliation": "Potential",
            "HRDQs": "Potential",
            "ATT (SQL)": "Potential",
            "ATT (Action Based)": "N/A",
            "File Automation": "Potential",
            "CDQ": "N/A"
        }
    },
    {
        name: "Mark Llarena",
        role: "BA",
        matrix: {
            "Eligibility": "Experience",
            "30-Hour calc": "Exposure",
            "Non-standard benefits": "Experience",
            "Pre-65 Retirees": "Experience",
            "Post-65 Retirees": "Experience",
            "Loading Rates": "Exposure",
            "LTD": "Experience",
            "STD": "Experience",
            "EOI calc": "Experience",
            "EOI Decision File": "Experience",
            "Events": "Expert",
            "AE Live Date": "Potential",
            "Mid-Year Live Date": "Potential",
            "WTW Standard Conversion Layouts": "Potential",
            "Data Dump Conversion Layout": "Potential",
            "Hours Conversion": "Potential",
            "901 Analysis": "Potential",
            "WTW Multi-file layout": "Potential",
            "WTW Single-file layout": "Potential",
            "Non-WTW file layout": "Potential",
            "Hours import": "Potential",
            "HSA status": "Potential",
            "Image import": "Potential",
            "Validations": "Potential",
            "ESS Next": "Expert",
            "Non- ESS Next": "Exposure",
            "SSO In": "Exposure",
            "SSO Out": "Experience",
            "ESS Customization": "Expert",
            "Embark Integration": "Experience",
            "Web Admin": "Exposure",
            "Plan Sponsor": "Exposure",
            "Communication Triggers": "Expert",
            "Print Communications": "Expert",
            "Email Communications": "Expert",
            "Text Communications": "Expert",
            "Custom Communications": "Expert",
            "SSRS Reports": "Expert",
            "Batch Reporting": "Expert",
            "Izenda": "Exposure",
            "Custom Reporting": "Expert",
            "WTW COBRA": "Exposure",
            "Non-WTW COBRA": "Exposure",
            "Direct Billing": "Potential",
            "WTW Benefit Accounts": "Potential",
            "Non-WTW Accounts": "Potential",
            "Event Verification": "Potential",
            "Dependent Verification": "Experience",
            "HCR Reporting": "Potential",
            "Carriers": "Potential",
            "Port & Convert": "Potential",
            "Premium Reporting": "Potential",
            "Vendor Payment": "Potential",
            "Non-WTW Verification": "Potential",
            "APIs": "Potential",
            "TDS Payroll": "Potential",
            "Closed Loop Payroll": "Potential",
            "TDS Billing Integration": "Potential",
            "Passthrough": "Potential",
            "Simon Procedures": "N/A",
            "Admin Guide": "Potential",
            "Overage": "Potential",
            "Age 65": "Potential",
            "Custom Processes": "N/A",
            "SFTP Setup": "Potential",
            "Calc": "Potential",
            "Export": "Potential",
            "Data Reconciliation": "Potential",
            "HRDQs": "Potential",
            "ATT (SQL)": "Potential",
            "ATT (Action Based)": "N/A",
            "File Automation": "Potential",
            "CDQ": "N/A"
        }
    },
    {
        name: "Kruffer Luche",
        role: "BA",
        matrix: {
            "Eligibility": "Experience",
            "30-Hour calc": "Exposure",
            "Non-standard benefits": "Experience",
            "Pre-65 Retirees": "Experience",
            "Post-65 Retirees": "Experience",
            "Loading Rates": "Exposure",
            "LTD": "Experience",
            "STD": "Experience",
            "EOI calc": "Experience",
            "EOI Decision File": "Experience",
            "Events": "Experience",
            "AE Live Date": "Potential",
            "Mid-Year Live Date": "Potential",
            "WTW Standard Conversion Layouts": "Potential",
            "Data Dump Conversion Layout": "Potential",
            "Hours Conversion": "Potential",
            "901 Analysis": "Potential",
            "WTW Multi-file layout": "Potential",
            "WTW Single-file layout": "Potential",
            "Non-WTW file layout": "Potential",
            "Hours import": "Potential",
            "HSA status": "Potential",
            "Image import": "Potential",
            "Validations": "Potential",
            "ESS Next": "Expert",
            "Non- ESS Next": "Exposure",
            "SSO In": "Exposure",
            "SSO Out": "Exposure",
            "ESS Customization": "Expert",
            "Embark Integration": "Exposure",
            "Web Admin": "Exposure",
            "Plan Sponsor": "Exposure",
            "Communication Triggers": "Expert",
            "Print Communications": "Expert",
            "Email Communications": "Expert",
            "Text Communications": "Expert",
            "Custom Communications": "Expert",
            "SSRS Reports": "Experience",
            "Batch Reporting": "Experience",
            "Izenda": "Exposure",
            "Custom Reporting": "Experience",
            "WTW COBRA": "Exposure",
            "Non-WTW COBRA": "Exposure",
            "Direct Billing": "Potential",
            "WTW Benefit Accounts": "Potential",
            "Non-WTW Accounts": "Potential",
            "Event Verification": "Potential",
            "Dependent Verification": "Experience",
            "HCR Reporting": "Potential",
            "Carriers": "Potential",
            "Port & Convert": "Potential",
            "Premium Reporting": "Potential",
            "Vendor Payment": "Potential",
            "Non-WTW Verification": "Potential",
            "APIs": "Potential",
            "TDS Payroll": "Potential",
            "Closed Loop Payroll": "Potential",
            "TDS Billing Integration": "Potential",
            "Passthrough": "Potential",
            "Simon Procedures": "N/A",
            "Admin Guide": "Potential",
            "Overage": "Potential",
            "Age 65": "Potential",
            "Custom Processes": "N/A",
            "SFTP Setup": "Potential",
            "Calc": "Potential",
            "Export": "Potential",
            "Data Reconciliation": "Potential",
            "HRDQs": "Potential",
            "ATT (SQL)": "Potential",
            "ATT (Action Based)": "N/A",
            "File Automation": "Potential",
            "CDQ": "N/A"
        }
    },
    {
        name: "Jomari Talavera",
        role: "BA",
        matrix: {
            "Eligibility": "Expert",
            "30-Hour calc": "Experience",
            "Non-standard benefits": "Expert",
            "Pre-65 Retirees": "Expert",
            "Post-65 Retirees": "Expert",
            "Loading Rates": "Expert",
            "LTD": "Expert",
            "STD": "Expert",
            "EOI calc": "Expert",
            "EOI Decision File": "Expert",
            "Events": "Expert",
            "AE Live Date": "Potential",
            "Mid-Year Live Date": "Potential",
            "WTW Standard Conversion Layouts": "Potential",
            "Data Dump Conversion Layout": "Potential",
            "Hours Conversion": "Potential",
            "901 Analysis": "Potential",
            "WTW Multi-file layout": "Potential",
            "WTW Single-file layout": "Experience",
            "Non-WTW file layout": "Potential",
            "Hours import": "Potential",
            "HSA status": "Experience",
            "Image import": "Potential",
            "Validations": "Exposure",
            "ESS Next": "Consulting",
            "Non- ESS Next": "Consulting",
            "SSO In": "Experience",
            "SSO Out": "Experience",
            "ESS Customization": "Expert",
            "Embark Integration": "Experience",
            "Web Admin": "Experience",
            "Plan Sponsor": "Exposure",
            "Communication Triggers": "Consulting",
            "Print Communications": "Consulting",
            "Email Communications": "Consulting",
            "Text Communications": "Consulting",
            "Custom Communications": "Consulting",
            "SSRS Reports": "Expert",
            "Batch Reporting": "Expert",
            "Izenda": "Expert",
            "Custom Reporting": "Expert",
            "WTW COBRA": "Expert",
            "Non-WTW COBRA": "Expert",
            "Direct Billing": "Expert",
            "WTW Benefit Accounts": "Expert",
            "Non-WTW Accounts": "Experience",
            "Event Verification": "Potential",
            "Dependent Verification": "Consulting",
            "HCR Reporting": "Exposure",
            "Carriers": "Exposure",
            "Port & Convert": "Exposure",
            "Premium Reporting": "Exposure",
            "Vendor Payment": "Potential",
            "Non-WTW Verification": "Potential",
            "APIs": "Potential",
            "TDS Payroll": "Expert",
            "Closed Loop Payroll": "Expert",
            "TDS Billing Integration": "Expert",
            "Passthrough": "Expert",
            "Simon Procedures": "Potential",
            "Admin Guide": "N/A",
            "Overage": "Experience",
            "Age 65": "Experience",
            "Custom Processes": "Experience",
            "SFTP Setup": "N/A",
            "Calc": "Potential",
            "Export": "Potential",
            "Data Reconciliation": "Potential",
            "HRDQs": "Consulting",
            "ATT (SQL)": "Consulting",
            "ATT (Action Based)": "Consulting",
            "File Automation": "N/A",
            "CDQ": "Consulting"
        }
    },
    {
        name: "Carl Andres",
        role: "Dev",
        matrix: {
            "Eligibility": "Potential",
            "30-Hour calc": "Potential",
            "Non-standard benefits": "Potential",
            "Pre-65 Retirees": "Potential",
            "Post-65 Retirees": "Potential",
            "Loading Rates": "Potential",
            "LTD": "Potential",
            "STD": "Potential",
            "EOI calc": "Potential",
            "EOI Decision File": "Potential",
            "Events": "Potential",
            "AE Live Date": "Potential",
            "Mid-Year Live Date": "Potential",
            "WTW Standard Conversion Layouts": "Potential",
            "Data Dump Conversion Layout": "Potential",
            "Hours Conversion": "Potential",
            "901 Analysis": "Potential",
            "WTW Multi-file layout": "Potential",
            "WTW Single-file layout": "Potential",
            "Non-WTW file layout": "Potential",
            "Hours import": "Potential",
            "HSA status": "Potential",
            "Image import": "Potential",
            "Validations": "Potential",
            "ESS Next": "Potential",
            "Non- ESS Next": "Experience",
            "SSO In": "Potential",
            "SSO Out": "Potential",
            "ESS Customization": "Potential",
            "Embark Integration": "Exposure",
            "Web Admin": "Exposure",
            "Plan Sponsor": "Potential",
            "Communication Triggers": "Potential",
            "Print Communications": "Potential",
            "Email Communications": "Potential",
            "Text Communications": "Potential",
            "Custom Communications": "Potential",
            "SSRS Reports": "Potential",
            "Batch Reporting": "Potential",
            "Izenda": "Potential",
            "Custom Reporting": "Potential",
            "WTW COBRA": "Potential",
            "Non-WTW COBRA": "Potential",
            "Direct Billing": "Potential",
            "WTW Benefit Accounts": "Potential",
            "Non-WTW Accounts": "Potential",
            "Event Verification": "Potential",
            "Dependent Verification": "Potential",
            "HCR Reporting": "Potential",
            "Carriers": "Potential",
            "Port & Convert": "Potential",
            "Premium Reporting": "Potential",
            "Vendor Payment": "Potential",
            "Non-WTW Verification": "Potential",
            "APIs": "Potential",
            "TDS Payroll": "Potential",
            "Closed Loop Payroll": "Potential",
            "TDS Billing Integration": "Potential",
            "Passthrough": "Potential",
            "Simon Procedures": "N/A",
            "Admin Guide": "Potential",
            "Overage": "Potential",
            "Age 65": "Potential",
            "Custom Processes": "N/A",
            "SFTP Setup": "Potential",
            "Calc": "Potential",
            "Export": "Potential",
            "Data Reconciliation": "Potential",
            "HRDQs": "Potential",
            "ATT (SQL)": "Potential",
            "ATT (Action Based)": "N/A",
            "File Automation": "Potential"
        }
    },
    {
        name: "Jhong Cawil",
        role: "Dev",
        matrix: {
            "Eligibility": "Exposure",
            "30-Hour calc": "Potential",
            "Non-standard benefits": "Exposure",
            "Pre-65 Retirees": "Exposure",
            "Post-65 Retirees": "Exposure",
            "Loading Rates": "Potential",
            "LTD": "Experience",
            "STD": "Experience",
            "EOI calc": "Experience",
            "EOI Decision File": "Experience",
            "Events": "Experience",
            "AE Live Date": "Potential",
            "Mid-Year Live Date": "Potential",
            "WTW Standard Conversion Layouts": "Potential",
            "Data Dump Conversion Layout": "Potential",
            "Hours Conversion": "Potential",
            "901 Analysis": "Potential",
            "WTW Multi-file layout": "Potential",
            "WTW Single-file layout": "Potential",
            "Non-WTW file layout": "Potential",
            "Hours import": "Potential",
            "HSA status": "Potential",
            "Image import": "Potential",
            "Validations": "Potential",
            "ESS Next": "Experience",
            "Non- ESS Next": "Potential",
            "SSO In": "Exposure",
            "SSO Out": "Exposure",
            "ESS Customization": "Experience",
            "Embark Integration": "Exposure",
            "Web Admin": "Potential",
            "Plan Sponsor": "Potential",
            "Communication Triggers": "Potential",
            "Print Communications": "Potential",
            "Email Communications": "Potential",
            "Text Communications": "Potential",
            "Custom Communications": "Potential",
            "SSRS Reports": "Experience",
            "Batch Reporting": "Experience",
            "Izenda": "Potential",
            "Custom Reporting": "Experience",
            "WTW COBRA": "Exposure",
            "Non-WTW COBRA": "Exposure",
            "Direct Billing": "Potential",
            "WTW Benefit Accounts": "Potential",
            "Non-WTW Accounts": "Potential",
            "Event Verification": "Potential",
            "Dependent Verification": "Potential",
            "HCR Reporting": "Potential",
            "Carriers": "Potential",
            "Port & Convert": "Potential",
            "Premium Reporting": "Potential",
            "Vendor Payment": "Potential",
            "Non-WTW Verification": "Potential",
            "APIs": "Potential",
            "TDS Payroll": "Potential",
            "Closed Loop Payroll": "Potential",
            "TDS Billing Integration": "Potential",
            "Passthrough": "N/A",
            "Simon Procedures": "Potential",
            "Admin Guide": "Potential",
            "Overage": "Potential",
            "Age 65": "N/A",
            "Custom Processes": "Potential",
            "SFTP Setup": "Potential",
            "Calc": "Potential",
            "Export": "Potential",
            "Data Reconciliation": "Potential",
            "HRDQs": "Potential",
            "ATT (SQL)": "N/A",
            "ATT (Action Based)": "Potential"
        }
    },
    {
        name: "Jorge De Los Reyes",
        role: "Dev",
        matrix: {
            "Eligibility": "Expert",
            "30-Hour calc": "Experience",
            "Non-standard benefits": "Expert",
            "Pre-65 Retirees": "Expert",
            "Post-65 Retirees": "Expert",
            "Loading Rates": "Experience",
            "LTD": "Expert",
            "STD": "Expert",
            "EOI calc": "Expert",
            "EOI Decision File": "Expert",
            "Events": "Expert",
            "AE Live Date": "Potential",
            "Mid-Year Live Date": "Potential",
            "WTW Standard Conversion Layouts": "Experience",
            "Data Dump Conversion Layout": "Potential",
            "Hours Conversion": "Potential",
            "901 Analysis": "Potential",
            "WTW Multi-file layout": "Experience",
            "WTW Single-file layout": "Experience",
            "Non-WTW file layout": "Experience",
            "Hours import": "Potential",
            "HSA status": "Exposure",
            "Image import": "Potential",
            "Validations": "Experience",
            "ESS Next": "Expert",
            "Non- ESS Next": "Consulting",
            "SSO In": "Expert",
            "SSO Out": "Expert",
            "ESS Customization": "Expert",
            "Embark Integration": "Exposure",
            "Web Admin": "Expert",
            "Plan Sponsor": "Potential",
            "Communication Triggers": "Consulting",
            "Print Communications": "Consulting",
            "Email Communications": "Consulting",
            "Text Communications": "Consulting",
            "Custom Communications": "Consulting",
            "SSRS Reports": "Consulting",
            "Batch Reporting": "Consulting",
            "Izenda": "Potential",
            "Custom Reporting": "Consulting",
            "WTW COBRA": "Experience",
            "Non-WTW COBRA": "Experience",
            "Direct Billing": "Potential",
            "WTW Benefit Accounts": "Potential",
            "Non-WTW Accounts": "Potential",
            "Event Verification": "Potential",
            "Dependent Verification": "Expert",
            "HCR Reporting": "Potential",
            "Carriers": "Expert",
            "Port & Convert": "Exposure",
            "Premium Reporting": "Exposure",
            "Vendor Payment": "Potential",
            "Non-WTW Verification": "Potential",
            "APIs": "Potential",
            "TDS Payroll": "Experience",
            "Closed Loop Payroll": "Experience",
            "TDS Billing Integration": "Experience",
            "Passthrough": "Experience",
            "Simon Procedures": "Potential",
            "Admin Guide": "N/A",
            "Overage": "Potential",
            "Age 65": "Potential",
            "Custom Processes": "Potential",
            "SFTP Setup": "N/A",
            "Calc": "Potential",
            "Export": "Potential",
            "Data Reconciliation": "Potential",
            "HRDQs": "Potential",
            "ATT (SQL)": "Potential",
            "ATT (Action Based)": "Potential",
            "File Automation": "N/A",
            "CDQ": "Potential"
        }
    },
    {
        name: "Gab Libanan",
        role: "Dev",
        matrix: {
            "Eligibility": "Potential",
            "30-Hour calc": "Potential",
            "Non-standard benefits": "Potential",
            "Pre-65 Retirees": "Potential",
            "Post-65 Retirees": "Potential",
            "Loading Rates": "Potential",
            "LTD": "Potential",
            "STD": "Potential",
            "EOI calc": "Potential",
            "EOI Decision File": "Potential",
            "Events": "Potential",
            "AE Live Date": "Potential",
            "Mid-Year Live Date": "Potential",
            "WTW Standard Conversion Layouts": "Potential",
            "Data Dump Conversion Layout": "Potential",
            "Hours Conversion": "Potential",
            "901 Analysis": "Potential",
            "WTW Multi-file layout": "Potential",
            "WTW Single-file layout": "Potential",
            "Non-WTW file layout": "Potential",
            "Hours import": "Potential",
            "HSA status": "Potential",
            "Image import": "Potential",
            "Validations": "Potential",
            "ESS Next": "Potential",
            "Non- ESS Next": "Potential",
            "SSO In": "Potential",
            "SSO Out": "Potential",
            "ESS Customization": "Potential",
            "Embark Integration": "Potential",
            "Web Admin": "Potential",
            "Plan Sponsor": "Potential",
            "Communication Triggers": "Potential",
            "Print Communications": "Potential",
            "Email Communications": "Potential",
            "Text Communications": "Potential",
            "Custom Communications": "Potential",
            "SSRS Reports": "Potential",
            "Batch Reporting": "Potential",
            "Izenda": "Potential",
            "Custom Reporting": "Potential",
            "WTW COBRA": "Potential",
            "Non-WTW COBRA": "Potential",
            "Direct Billing": "Potential",
            "WTW Benefit Accounts": "Potential",
            "Non-WTW Accounts": "Potential",
            "Event Verification": "Expert",
            "Dependent Verification": "Expert",
            "HCR Reporting": "Expert",
            "Carriers": "Experience",
            "Port & Convert": "Potential",
            "Premium Reporting": "Potential",
            "Vendor Payment": "Potential",
            "Non-WTW Verification": "Potential",
            "APIs": "Potential",
            "TDS Payroll": "Potential",
            "Closed Loop Payroll": "Potential",
            "TDS Billing Integration": "N/A",
            "Passthrough": "Potential",
            "Simon Procedures": "Potential",
            "Admin Guide": "Potential",
            "Overage": "N/A",
            "Age 65": "Potential",
            "Custom Processes": "Potential",
            "SFTP Setup": "Potential",
            "Calc": "Potential",
            "Export": "Potential",
            "Data Reconciliation": "Potential",
            "HRDQs": "N/A",
            "ATT (SQL)": "Potential"
        }
    },
    {
        name: "Carleen Tolentino",
        role: "Dev",
        matrix: {
            "Eligibility": "Experience",
            "30-Hour calc": "Potential",
            "Non-standard benefits": "Experience",
            "Pre-65 Retirees": "Experience",
            "Post-65 Retirees": "Experience",
            "Loading Rates": "Potential",
            "LTD": "Experience",
            "STD": "Experience",
            "EOI calc": "Experience",
            "EOI Decision File": "Experience",
            "Events": "Expert",
            "AE Live Date": "Potential",
            "Mid-Year Live Date": "Potential",
            "WTW Standard Conversion Layouts": "Experience",
            "Data Dump Conversion Layout": "Potential",
            "Hours Conversion": "Potential",
            "901 Analysis": "Potential",
            "WTW Multi-file layout": "Experience",
            "WTW Single-file layout": "Experience",
            "Non-WTW file layout": "Experience",
            "Hours import": "Potential",
            "HSA status": "Potential",
            "Image import": "Potential",
            "Validations": "Experience",
            "ESS Next": "Expert",
            "Non- ESS Next": "Expert",
            "SSO In": "Expert",
            "SSO Out": "Expert",
            "ESS Customization": "Expert",
            "Embark Integration": "Exposure",
            "Web Admin": "Experience",
            "Plan Sponsor": "Potential",
            "Communication Triggers": "Expert",
            "Print Communications": "Expert",
            "Email Communications": "Expert",
            "Text Communications": "Expert",
            "Custom Communications": "Expert",
            "SSRS Reports": "Consulting",
            "Batch Reporting": "Consulting",
            "Izenda": "Potential",
            "Custom Reporting": "Consulting",
            "WTW COBRA": "Exposure",
            "Non-WTW COBRA": "Exposure",
            "Direct Billing": "Potential",
            "WTW Benefit Accounts": "Potential",
            "Non-WTW Accounts": "Potential",
            "Event Verification": "Potential",
            "Dependent Verification": "Expert",
            "HCR Reporting": "Potential",
            "Carriers": "Experience",
            "Port & Convert": "Potential",
            "Premium Reporting": "Potential",
            "Vendor Payment": "Potential",
            "Non-WTW Verification": "Potential",
            "APIs": "Potential",
            "TDS Payroll": "Experience",
            "Closed Loop Payroll": "Experience",
            "TDS Billing Integration": "Experience",
            "Passthrough": "Experience",
            "Simon Procedures": "Potential",
            "Admin Guide": "N/A",
            "Overage": "Potential",
            "Age 65": "Potential",
            "Custom Processes": "Potential",
            "SFTP Setup": "N/A",
            "Calc": "Potential",
            "Export": "Potential",
            "Data Reconciliation": "Potential",
            "HRDQs": "Potential",
            "ATT (SQL)": "Potential",
            "ATT (Action Based)": "Potential",
            "File Automation": "N/A",
            "CDQ": "Potential"
        }
    }
];

// PROFICIENCY MAP
const PROFICIENCY_MAP: Record<string, number> = {
    'N/A': 894790000,
    'Potential': 894790001,
    'Exposure': 894790002,
    'Experience': 894790003,
    'Expert': 894790004,
    'Consulting': 894790005
};

export function SDTOnlySeedProfileData() {
    const [isSeeding, setIsSeeding] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [status, setStatus] = useState("Ready to seed Profiles and Assessments.");

    // Extract all unique skills dynamically to build the table headers
    const allSkills = useMemo(() => {
        const skillsSet = new Set<string>();
        SAMPLES.forEach(colleague => {
            if (colleague.matrix) {
                Object.keys(colleague.matrix).forEach(skill => skillsSet.add(skill));
            }
        });
        return Array.from(skillsSet).sort(); // Sorted alphabetically for easier reading
    }, []);

    // --- CLEAR FUNCTION ---
    async function runClear() {
        if (!window.confirm("Are you sure you want to delete ALL Colleague Profiles and Assessments? This cannot be undone.")) {
            return;
        }

        setIsClearing(true);
        setStatus("Fetching records to delete...");

        try {
            const assessmentsResult = await Wtw_skillassessmentsService.getAll();
            const assessmentsData = assessmentsResult.data || assessmentsResult;

            let deletedAssessments = 0;
            for (const assessment of assessmentsData) {
                const id = assessment.wtw_skillassessmentid;
                if (id) {
                    await Wtw_skillassessmentsService.delete(id);
                    deletedAssessments++;
                    setStatus(`Deleted ${deletedAssessments} Assessments...`);
                }
            }

            const profilesResult = await Wtw_colleagueprofilesService.getAll();
            const profilesData = profilesResult.data || profilesResult;

            let deletedProfiles = 0;
            for (const profile of profilesData) {
                const id = profile.wtw_colleagueprofileid;
                if (id) {
                    await Wtw_colleagueprofilesService.delete(id);
                    deletedProfiles++;
                    setStatus(`Deleted ${deletedProfiles} Profiles...`);
                }
            }

            setStatus(`Cleared! Wiped ${deletedProfiles} Profiles and ${deletedAssessments} Assessments.`);
        } catch (error) {
            console.error("Clearing failed:", error);
            setStatus("Error occurred while clearing. Check console.");
        } finally {
            setIsClearing(false);
        }
    }

    // --- SEED FUNCTION ---
    async function runSeed() {
        if (!window.confirm(`You are about to create ${SAMPLES.length} profiles. Proceed?`)) return;

        setIsSeeding(true);
        setStatus("Fetching Skill Library mapping...");

        try {
            const skillsResult = await Wtw_skilllibrariesService.getAll();
            const skillsData = skillsResult.data || skillsResult;

            const skillMap: Record<string, string> = {};
            skillsData.forEach((skill: any) => {
                const name = skill.wtw_skillname || skill.wtw_name;
                const id = skill.wtw_skilllibraryid;
                if (name && id) skillMap[name] = id;
            });

            let profilesCreated = 0;
            let assessmentsCreated = 0;

            for (const colleague of SAMPLES) {
                setStatus(`Creating Profile for ${colleague.name}...`);

                const profileResult = await Wtw_colleagueprofilesService.create({
                    wtw_colleaguename: colleague.name,
                    wtw_jobrole: colleague.role
                } as any);

                const profileId = (profileResult as any)?.wtw_colleagueprofileid || profileResult?.data?.wtw_colleagueprofileid;

                if (profileId) {
                    profilesCreated++;
                    const skillNames = Object.keys(colleague.matrix);

                    for (const skillName of skillNames) {
                        const skillGuid = skillMap[skillName];

                        if (skillGuid) {
                            setStatus(`Linking ${skillName} to ${colleague.name}...`);
                            const levelString = colleague.matrix[skillName as keyof typeof colleague.matrix];
                            const proficiencyInt = PROFICIENCY_MAP[levelString as string] || 894790000;

                            await Wtw_skillassessmentsService.create({
                                wtw_skillassessment1: `${colleague.name} - ${skillName}`,
                                wtw_proficiency: proficiencyInt,
                                wtw_isfavorite: false,
                                "wtw_Colleague@odata.bind": `/wtw_colleagueprofiles(${profileId})`,
                                "wtw_Skill@odata.bind": `/wtw_skilllibraries(${skillGuid})`
                            } as any);

                            assessmentsCreated++;
                        } else {
                            console.warn(`Could not find skill "${skillName}" in Dataverse library. Skipping.`);
                        }
                    }
                }
            }
            setStatus(`Success! Created ${profilesCreated} Profiles and ${assessmentsCreated} Assessments.`);
        } catch (error) {
            console.error("Seeding failed:", error);
            setStatus("Error occurred. Check console.");
        } finally {
            setIsSeeding(false);
        }
    }

    const isProcessing = isSeeding || isClearing;

    return (
        <div className="p-6 max-w-[1920px] w-full mx-auto mt-6">

            {/* Action Panel */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                <div>
                    <h2 className="text-xl font-black text-slate-800">Colleague Matrix Seeder</h2>
                    <p className="text-sm text-slate-500 mt-1">Review your raw data payload before committing it to Dataverse.</p>
                    <div className="mt-3 inline-block px-3 py-1 bg-purple-50 text-[#622F88] text-xs font-bold rounded-lg border border-purple-100">
                        Status: {status}
                    </div>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        onClick={runClear}
                        disabled={isProcessing}
                        className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 px-6 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 md:flex-none whitespace-nowrap shadow-sm"
                    >
                        {isClearing ? "Clearing..." : "1. Clear Database"}
                    </button>
                    <button
                        onClick={runSeed}
                        disabled={isProcessing}
                        className="bg-[#622F88] hover:bg-[#4C1D95] text-white px-8 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 md:flex-none whitespace-nowrap shadow-md"
                    >
                        {isSeeding ? "Processing..." : "2. Execute Seed"}
                    </button>
                </div>
            </div>

            {/* Data Preview Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                        Data Payload Preview
                    </h3>
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                        {SAMPLES.length} Profiles • {allSkills.length} Mapped Skills
                    </div>
                </div>

                <div className="overflow-auto max-h-[65vh]">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-slate-100 sticky top-0 z-20 shadow-sm">
                            <tr>
                                {/* Sticky Name Header */}
                                <th className="p-3 text-[10px] font-black text-slate-500 uppercase tracking-widest sticky left-0 bg-slate-100 z-30 border-r border-b border-slate-200 min-w-[200px]">
                                    Colleague Name
                                </th>
                                <th className="p-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-b border-slate-200 min-w-[100px]">
                                    Role
                                </th>
                                {/* Dynamically Map Skill Headers */}
                                {allSkills.map(skill => (
                                    <th key={skill} className="p-3 text-[10px] font-bold text-slate-500 border-b border-r border-slate-200" title={skill}>
                                        {skill.length > 20 ? skill.substring(0, 20) + '...' : skill}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {SAMPLES.map((c, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    {/* Sticky Name Column */}
                                    <td className="p-3 sticky left-0 bg-white border-r border-slate-100 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                        <span className="font-bold text-sm text-slate-800">{c.name}</span>
                                    </td>
                                    <td className="p-3 font-black text-[10px] text-[#622F88] uppercase tracking-widest border-r border-slate-100">
                                        {c.role}
                                    </td>
                                    {/* Dynamically Map Skill Values */}
                                    {allSkills.map(skill => {
                                        const value = c.matrix[skill as keyof typeof c.matrix] || 'N/A';
                                        return (
                                            <td key={skill} className={`p-3 text-xs font-semibold border-r border-slate-50 ${value !== 'N/A' ? 'text-slate-700' : 'text-slate-300'}`}>
                                                {value}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}