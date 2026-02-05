import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import Company from '../model/Company.js';
import Employee from '../model/Employees.js';

dotenv.config();

const createTestAccounts = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ Connected to MongoDB');

        // Create test company
        const hashedPassword = await bcrypt.hash('TestPass123!', 10);
        
        const testCompany = new Company({
            companyName: 'Test Company Inc',
            email: 'testcompany@example.com',
            password: hashedPassword,
            companyAddress: '123 Test Street, Test City',
            activeStatus: true,
            status: true,
            isSuperAdmin: false,
            industry: 'Technology',
            subDomain: 'testcompany',
            firstTimeLogin: false
        });

        await testCompany.save();
        console.log('✅ Test company created');
        console.log('   Email: testcompany@example.com');
        console.log('   Password: TestPass123!');
        console.log('   Company ID:', testCompany._id);

        // Create test employee
        const empPassword = await bcrypt.hash('EmpPass123!', 10);
        
        const testEmployee = new Employee({
            firstName: 'John',
            lastName: 'Doe',
            fullName: 'John Doe',
            email: 'testemployee@example.com',
            password: empPassword,
            companyId: testCompany._id,
            companyName: testCompany.companyName,
            department: 'Engineering',
            designationName: 'Software Engineer',
            activeStatus: true,
            status: 'Active',
            firstTimeLogin: false,
            leaveAssignment: [],
            approvals: []
        });

        await testEmployee.save();
        console.log('✅ Test employee created');
        console.log('   Email: testemployee@example.com');
        console.log('   Password: EmpPass123!');
        console.log('   Employee ID:', testEmployee._id);
        
        console.log('\n=== Test Accounts Created Successfully ===');
        
        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error creating test accounts:', error.message);
        mongoose.connection.close();
    }
};

createTestAccounts();
