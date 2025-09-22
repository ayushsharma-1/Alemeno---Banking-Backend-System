class Customer {
  constructor(data) {
    this.customerId = data['Customer ID'];
    this.firstName = data['First Name'];
    this.lastName = data['Last Name'];
    this.age = data['Age'];
    this.phoneNumber = data['Phone Number'];
    this.monthlySalary = data['Monthly Salary'];
    this.approvedLimit = data['Approved Limit'];
  }

  static fromExcelData(data) {
    return new Customer(data);
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  getCreditScore() {
    const salaryScore = Math.min(this.monthlySalary / 1000, 50);
    const limitScore = Math.min(this.approvedLimit / 100000, 30);
    const ageScore = this.age >= 21 && this.age <= 65 ? 20 : 10;
    
    return Math.round(salaryScore + limitScore + ageScore);
  }

  toJSON() {
    return {
      customerId: this.customerId,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.getFullName(),
      age: this.age,
      phoneNumber: this.phoneNumber,
      monthlySalary: this.monthlySalary,
      approvedLimit: this.approvedLimit,
      creditScore: this.getCreditScore()
    };
  }
}

module.exports = Customer;