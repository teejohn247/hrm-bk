const bcrypt = require('bcrypt');

async function generateHash() {
    const companyPassword = 'TestPass123!';
    const employeePassword = 'EmpPass123!';
    
    const companyHash = await bcrypt.hash(companyPassword, 10);
    const employeeHash = await bcrypt.hash(employeePassword, 10);
    
    console.log('\n=== Password Hashes Generated ===\n');
    console.log('Company Password: TestPass123!');
    console.log('Company Hash:', companyHash);
    console.log('\nEmployee Password: EmpPass123!');
    console.log('Employee Hash:', employeeHash);
    console.log('\nUse these hashes when manually inserting test accounts in MongoDB\n');
}

generateHash();
