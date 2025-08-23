import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { StatsResponse } from '../page';

export async function exportToExcel(
  stats: StatsResponse,
  locationName?: string,
  areaNameMap: Record<string, string> = {},
  locationNameMap: Record<string, string> = {}
) {
  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Safety Statistics', {
    properties: { tabColor: { argb: '2B5797' } },
  });

  // Define reusable styles
  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '2B5797' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    },
  };

  const subheaderStyle = {
    font: { bold: true, size: 12 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E6E6E6' } },
    alignment: { horizontal: 'left', vertical: 'middle' },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    },
  };

  const tableCellStyle = {
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    },
    alignment: { vertical: 'middle' },
  };

  // Define number formats
  const integerFormat = '#,##0';
  const decimalFormat = '#,##0.00';

  // Add company header section
  worksheet.addRow([]);
  worksheet.mergeCells('B2:G2');
  const titleCell = worksheet.getCell('B2');
  titleCell.value = 'ProSafe - Safety Events Statistics Report';
  titleCell.font = {
    name: 'Arial',
    size: 18,
    bold: true,
    color: { argb: '2B5797' },
  };
  titleCell.alignment = { horizontal: 'center' };

  // Add logo placeholder
  worksheet.mergeCells('B3:G3');
  const logoCell = worksheet.getCell('B3');
  logoCell.value = 'ProSafe';
  logoCell.font = {
    name: 'Arial',
    size: 14,
    bold: true,
    color: { argb: '2B5797' },
  };
  logoCell.alignment = { horizontal: 'center' };

  // Add report information
  worksheet.mergeCells('B4:C4');
  worksheet.getCell('B4').value = 'Report Date:';
  worksheet.getCell('B4').font = { bold: true };
  worksheet.getCell('B4').alignment = { horizontal: 'right' };

  worksheet.mergeCells('D4:E4');
  worksheet.getCell('D4').value = new Date().toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (locationName) {
    worksheet.mergeCells('B5:C5');
    worksheet.getCell('B5').value = 'Location:';
    worksheet.getCell('B5').font = { bold: true };
    worksheet.getCell('B5').alignment = { horizontal: 'right' };

    worksheet.mergeCells('D5:E5');
    worksheet.getCell('D5').value = locationName;
  }

  // Add Summary Statistics section
  worksheet.addRow([]);
  worksheet.addRow([]);
  const summaryHeaderRow = worksheet.addRow(['', 'Summary Statistics']);
  applyStyleToRow(summaryHeaderRow, headerStyle);
  worksheet.mergeCells(`B${summaryHeaderRow.number}:E${summaryHeaderRow.number}`);

  // Add summary data with formatting
  const summaryLabels = ['Total Events', 'Total Violations', 'Average Violations per Event'];
  const summaryValues = [stats.totalEvents, stats.totalViolations, stats.avgViolationsPerEvent];

  for (let i = 0; i < summaryLabels.length; i++) {
    const row = worksheet.addRow(['', summaryLabels[i], '', summaryValues[i]]);

    // Apply cell styling
    const labelCell = row.getCell(2);
    const valueCell = row.getCell(4);

    Object.assign(labelCell, tableCellStyle);
    Object.assign(valueCell, tableCellStyle);
    valueCell.alignment = { horizontal: 'right', vertical: 'middle' };

    // Number formatting
    if (i === 2) {
      // Average value needs decimal format
      valueCell.numFmt = decimalFormat;
    } else {
      valueCell.numFmt = integerFormat;
    }
  }

  // Status Distribution
  worksheet.addRow([]);
  const statusHeaderRow = worksheet.addRow(['', 'Status Distribution']);
  applyStyleToRow(statusHeaderRow, headerStyle);
  worksheet.mergeCells(`B${statusHeaderRow.number}:E${statusHeaderRow.number}`);

  // Status table headers
  const statusTableHeaders = worksheet.addRow(['', 'Status', '', 'Count']);
  applyStyleToRow(statusTableHeaders, subheaderStyle);

  // Status data rows with alternating colors
  let rowIndex = 0;
  Object.entries(stats.statusCounts).forEach(([status, count]) => {
    const row = worksheet.addRow(['', status, '', count]);

    // Apply alternating row styles
    const rowColor = rowIndex % 2 === 0 ? 'F5F5F5' : 'FFFFFF';
    applyAlternatingRowStyle(row, rowColor, tableCellStyle);

    // Format the count cell
    const countCell = row.getCell(4);
    countCell.alignment = { horizontal: 'right', vertical: 'middle' };
    countCell.numFmt = integerFormat;

    rowIndex++;
  });

  // Events Over Time Section
  worksheet.addRow([]);
  const timeHeaderRow = worksheet.addRow(['', 'Events Over Time']);
  applyStyleToRow(timeHeaderRow, headerStyle);
  worksheet.mergeCells(`B${timeHeaderRow.number}:E${timeHeaderRow.number}`);

  // Events Over Time table headers
  const timeTableHeaders = worksheet.addRow(['', 'Date', 'Handled', 'Unhandled', 'Total']);
  applyStyleToRow(timeTableHeaders, subheaderStyle);

  // Events Over Time data rows
  rowIndex = 0;
  stats.eventsByDateStatus.forEach((item) => {
    const date = new Date(item.date).toLocaleDateString('he-IL');
    const row = worksheet.addRow(['', date, item.handled, item.unhandled, item.total]);

    // Apply alternating row styles
    const rowColor = rowIndex % 2 === 0 ? 'F5F5F5' : 'FFFFFF';
    applyAlternatingRowStyle(row, rowColor, tableCellStyle);

    // Format number cells
    for (let i = 3; i <= 5; i++) {
      const cell = row.getCell(i);
      cell.numFmt = integerFormat;
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
    }

    rowIndex++;
  });

  // Events by Location Section
  worksheet.addRow([]);
  const locationHeaderRow = worksheet.addRow(['', 'Events by Location']);
  applyStyleToRow(locationHeaderRow, headerStyle);
  worksheet.mergeCells(`B${locationHeaderRow.number}:E${locationHeaderRow.number}`);

  // Location table headers
  const locationTableHeaders = worksheet.addRow(['', 'Location', 'Handled', 'Unhandled', 'Total']);
  applyStyleToRow(locationTableHeaders, subheaderStyle);

  // Location data rows
  rowIndex = 0;
  stats.eventsByLocationStatus.forEach((item) => {
    const locationDisplayName = locationNameMap[item.locationId] || item.locationId;
    const total = item.handled + item.unhandled;
    const row = worksheet.addRow(['', locationDisplayName, item.handled, item.unhandled, total]);

    // Apply alternating row styles
    const rowColor = rowIndex % 2 === 0 ? 'F5F5F5' : 'FFFFFF';
    applyAlternatingRowStyle(row, rowColor, tableCellStyle);

    // Format number cells
    for (let i = 3; i <= 5; i++) {
      const cell = row.getCell(i);
      cell.numFmt = integerFormat;
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
    }

    rowIndex++;
  });

  // Events by Area Section
  worksheet.addRow([]);
  const areaHeaderRow = worksheet.addRow(['', 'Events by Area']);
  applyStyleToRow(areaHeaderRow, headerStyle);
  worksheet.mergeCells(`B${areaHeaderRow.number}:E${areaHeaderRow.number}`);

  // Area table headers
  const areaTableHeaders = worksheet.addRow(['', 'Area', 'Handled', 'Unhandled', 'Total']);
  applyStyleToRow(areaTableHeaders, subheaderStyle);

  // Area data rows
  rowIndex = 0;
  stats.eventsByAreaStatus.forEach((item) => {
    const areaDisplayName = areaNameMap[item.areaId] || item.areaId;
    const total = item.handled + item.unhandled;
    const row = worksheet.addRow(['', areaDisplayName, item.handled, item.unhandled, total]);

    // Apply alternating row styles
    const rowColor = rowIndex % 2 === 0 ? 'F5F5F5' : 'FFFFFF';
    applyAlternatingRowStyle(row, rowColor, tableCellStyle);

    // Format number cells
    for (let i = 3; i <= 5; i++) {
      const cell = row.getCell(i);
      cell.numFmt = integerFormat;
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
    }

    rowIndex++;
  });

  // Severity Distribution Section
  worksheet.addRow([]);
  const severityHeaderRow = worksheet.addRow(['', 'Violation Severity Distribution']);
  applyStyleToRow(severityHeaderRow, headerStyle);
  worksheet.mergeCells(`B${severityHeaderRow.number}:E${severityHeaderRow.number}`);

  // Severity table headers
  const severityTableHeaders = worksheet.addRow(['', 'Severity', 'Count', 'Percentage']);
  applyStyleToRow(severityTableHeaders, subheaderStyle);

  // Severity data rows
  rowIndex = 0;
  stats.severityDistribution?.forEach((item) => {
    const row = worksheet.addRow(['', item.severity, item.count, item.percentage]);

    // Apply alternating row styles
    const rowColor = rowIndex % 2 === 0 ? 'F5F5F5' : 'FFFFFF';
    applyAlternatingRowStyle(row, rowColor, tableCellStyle);

    // Format number cells
    const countCell = row.getCell(3);
    countCell.numFmt = integerFormat;
    countCell.alignment = { horizontal: 'right', vertical: 'middle' };

    const percentageCell = row.getCell(4);
    percentageCell.numFmt = '0.0%';
    percentageCell.alignment = { horizontal: 'right', vertical: 'middle' };

    rowIndex++;
  });

  // Set column widths for better readability
  worksheet.getColumn(1).width = 5; // Margin
  worksheet.getColumn(2).width = 30; // Names/labels
  worksheet.getColumn(3).width = 15; // Values
  worksheet.getColumn(4).width = 15; // Values
  worksheet.getColumn(5).width = 15; // Values

  // Generate the Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  // Save the file
  saveAs(blob, `ProSafe_Statistics_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Helper function to apply style to an entire row
function applyStyleToRow(row: ExcelJS.Row, style: unknown) {
  for (let i = 2; i <= 5; i++) {
    const cell = row.getCell(i);
    Object.assign(cell, style);
  }
}

// Helper function to apply alternating row style
function applyAlternatingRowStyle(row: ExcelJS.Row, colorArgb: string, baseStyle: unknown) {
  for (let i = 2; i <= 5; i++) {
    const cell = row.getCell(i);
    Object.assign(cell, baseStyle);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: colorArgb },
    };
  }
}
