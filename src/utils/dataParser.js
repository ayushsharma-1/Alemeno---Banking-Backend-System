const XLSX = require('xlsx');
const path = require('path');

class DataParser {
  static parseExcelFile(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetNames = workbook.SheetNames;
      const result = {};
      
      sheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        result[sheetName] = XLSX.utils.sheet_to_json(worksheet);
      });
      
      return result;
    } catch (error) {
      throw new Error(`Error parsing Excel file ${filePath}: ${error.message}`);
    }
  }
  
  static loadCustomerData() {
    const filePath = path.join(__dirname, '../../customer_data.xlsx');
    return this.parseExcelFile(filePath);
  }
  
  static loadLoanData() {
    const filePath = path.join(__dirname, '../../loan_data.xlsx');
    return this.parseExcelFile(filePath);
  }
  
  static getAllData() {
    return {
      customers: this.loadCustomerData(),
      loans: this.loadLoanData()
    };
  }
}

module.exports = DataParser;