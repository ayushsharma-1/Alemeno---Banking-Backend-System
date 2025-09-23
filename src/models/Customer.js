class Customer {
  constructor(data) {
    // Handle both Excel data format and API format
    this.customer_id = data['Customer ID'] || data.customer_id;
    this.customerId = this.customer_id; // For backward compatibility
    this.first_name = data['First Name'] || data.first_name;
    this.firstName = this.first_name; // For backward compatibility
    this.last_name = data['Last Name'] || data.last_name;
    this.lastName = this.last_name; // For backward compatibility
    this.age = data['Age'] || data.age;
    this.phone_number = data['Phone Number'] || data.phone_number;
    this.phoneNumber = this.phone_number; // For backward compatibility
    this.monthly_income = data['Monthly Salary'] || data.monthly_income;
    this.monthlySalary = this.monthly_income; // For backward compatibility
    this.approved_limit = data['Approved Limit'] || data.approved_limit;
    this.approvedLimit = this.approved_limit; // For backward compatibility
    this.current_debt = data['Current Debt'] || data.current_debt || 0;
  }

  static fromExcelData(data) {
    return new Customer(data);
  }

  getFullName() {
    return `${this.first_name} ${this.last_name}`;
  }

  getCreditScore() {
    const salaryScore = Math.min(this.monthly_income / 1000, 50);
    const limitScore = Math.min(this.approved_limit / 100000, 30);
    const ageScore = this.age >= 21 && this.age <= 65 ? 20 : 10;
    
    return Math.round(salaryScore + limitScore + ageScore);
  }

  toJSON() {
    return {
      customer_id: this.customer_id,
      customerId: this.customer_id, // For backward compatibility
      first_name: this.first_name,
      firstName: this.first_name, // For backward compatibility
      last_name: this.last_name,
      lastName: this.last_name, // For backward compatibility
      fullName: this.getFullName(),
      age: this.age,
      phone_number: this.phone_number,
      phoneNumber: this.phone_number, // For backward compatibility
      monthly_income: this.monthly_income,
      monthlySalary: this.monthly_income, // For backward compatibility
      approved_limit: this.approved_limit,
      approvedLimit: this.approved_limit, // For backward compatibility
      current_debt: this.current_debt,
      creditScore: this.getCreditScore()
    };
  }
}

module.exports = Customer;