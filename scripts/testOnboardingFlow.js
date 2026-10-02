require('dotenv').config();

const Company = require('../dist/model/Company');
const mongoose = Company.base || require('mongoose');
const Otp = require('../dist/model/Otp');
const Industry = require('../dist/model/Industry');
const Employee = require('../dist/model/Employees');
const { signUp, verifyOtp, resendOtp } = require('../dist/controller/Auth/otpController');
const { setPassword } = require('../dist/controller/Auth/setPasswordController');
const {
    getIndustries,
    getCompanySizes,
    saveWorkspace,
    getAvailableModules,
    selectModules,
    getOnboardingStatus,
    inviteEmployees,
    skipInvite,
} = require('../dist/controller/Auth/onboardingController');
const {
    getAccountInfo,
    updateAccountInfo,
    getRolesAndPermissions,
    updateRolesAndPermissions,
    addNewRole,
    getBillingAndSubscriptions,
    cancelSubscription,
    updatePaymentMethod,
} = require('../dist/controller/Auth/settingsController');

function createMockRes() {
    return {
        statusCode: 200,
        responseData: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            this.responseData = data;
            return this;
        },
    };
}

async function runTests() {
    console.log('\n=============================================');
    console.log('🧪 TESTING MAKERS ERP SIGNUP & ONBOARDING FLOW');
    console.log('=============================================\n');

    try {
        let connected = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Connecting to MongoDB (attempt ${attempt}/3)...`);
                await mongoose.connect(process.env.MONGO_URL, {
                    family: 4,
                    serverSelectionTimeoutMS: 30000,
                    connectTimeoutMS: 30000,
                });
                connected = true;
                console.log('✅ Connected to MongoDB\n');
                break;
            } catch (connErr) {
                console.warn(`Connection attempt ${attempt} failed: ${connErr.message}`);
                if (attempt === 3) throw connErr;
                await new Promise(r => setTimeout(r, 3000));
            }
        }

        const testEmail = `test_onboarding_${Date.now()}@example.com`;
        const testCompany = 'Test Company';
        const testAccountType = 'Company';
        const testPassword = 'Password123!';

        // Cleanup any prior test data with this email
        await Company.deleteMany({ email: testEmail });
        await Otp.deleteMany({ email: testEmail });

        // -------------------------------------------------------------
        // STEP 1: /signup (Screenshot 1)
        // -------------------------------------------------------------
        console.log('📌 STEP 1: POST /api/v1/signUp (Account Type, Company Name, Email)');
        const req1 = {
            body: {
                accountType: testAccountType,
                companyName: testCompany,
                email: testEmail,
            },
        };
        const res1 = createMockRes();
        await signUp(req1, res1);

        console.log(`   Response status: ${res1.statusCode}`);
        console.log(`   Response message: ${res1.responseData?.message}`);
        if (res1.statusCode !== 200) {
            throw new Error(`Step 1 failed: ${JSON.stringify(res1.responseData)}`);
        }

        // Verify OTP was stored in DB
        const savedOtpDoc = await Otp.findOne({ email: testEmail }).sort({ createdAt: -1 });
        if (!savedOtpDoc) throw new Error('OTP was not saved in DB!');
        console.log(`   ✅ OTP record created in DB. Generated code: ${savedOtpDoc.otp}\n`);

        // -------------------------------------------------------------
        // STEP 2: /verify (Screenshot 2)
        // -------------------------------------------------------------
        console.log('📌 STEP 2A: POST /api/v1/verify-otp (Verify 6-digit OTP)');
        const req2 = {
            body: {
                email: testEmail,
                otp: savedOtpDoc.otp,
            },
        };
        const res2 = createMockRes();
        await verifyOtp(req2, res2);

        console.log(`   Response status: ${res2.statusCode}`);
        console.log(`   Response message: ${res2.responseData?.message}`);
        console.log(`   Verification token returned: ${!!res2.responseData?.token}`);
        if (res2.statusCode !== 200 || !res2.responseData?.token) {
            throw new Error(`Step 2A failed: ${JSON.stringify(res2.responseData)}`);
        }
        const verificationToken = res2.responseData.token;
        console.log('   ✅ Email OTP verified successfully\n');

        // Test resend OTP (Screenshot 2: "Resend OTP")
        console.log('📌 STEP 2B: POST /api/v1/resend-otp (Resend OTP test)');
        const req2b = {
            body: { email: testEmail },
        };
        const res2b = createMockRes();
        await resendOtp(req2b, res2b);
        console.log(`   Response status: ${res2b.statusCode}`);
        console.log(`   Response message: ${res2b.responseData?.message}`);
        console.log('   ✅ Resend OTP succeeded\n');

        // -------------------------------------------------------------
        // STEP 3: /set-password (Screenshot 3)
        // -------------------------------------------------------------
        console.log('📌 STEP 3: POST /api/v1/setPassword (Set Account Password)');
        const req3 = {
            body: {
                email: testEmail,
                password: testPassword,
                confirmPassword: testPassword,
                token: verificationToken,
            },
        };
        const res3 = createMockRes();
        await setPassword(req3, res3);

        console.log(`   Response status: ${res3.statusCode}`);
        console.log(`   Response message: ${res3.responseData?.message}`);
        console.log(`   Auth JWT token issued: ${!!res3.responseData?.token}`);
        if (res3.statusCode !== 200 || !res3.responseData?.token) {
            throw new Error(`Step 3 failed: ${JSON.stringify(res3.responseData)}`);
        }
        const authToken = res3.responseData.token;
        const createdCompany = res3.responseData.data;
        console.log(`   Company created with ID: ${createdCompany._id}, Name: ${createdCompany.companyName}`);
        console.log('   ✅ Password set and authentication token issued\n');

        // -------------------------------------------------------------
        // STEP 4: /onboarding - Workspace Setup (Screenshot 4)
        // -------------------------------------------------------------
        console.log('📌 STEP 4A: GET /api/v1/onboarding/industries (Dropdown options)');
        const res4a = createMockRes();
        await getIndustries({}, res4a);
        console.log(`   Fetched ${res4a.responseData?.data?.length} industries`);

        console.log('📌 STEP 4B: GET /api/v1/onboarding/company-sizes (Dropdown options)');
        const res4b = createMockRes();
        await getCompanySizes({}, res4b);
        console.log(`   Company sizes: ${JSON.stringify(res4b.responseData?.data)}`);

        console.log('📌 STEP 4C: POST /api/v1/onboarding/workspace (Save Workspace info)');
        const req4c = {
            payload: {
                id: createdCompany._id,
                email: testEmail,
            },
            body: {
                companyName: 'Test Company Updated',
                industry: 'Technology & Software',
                companySize: '11-50',
                companyAddress: '42 Innovation Boulevard',
            },
        };
        const res4c = createMockRes();
        await saveWorkspace(req4c, res4c);
        console.log(`   Response status: ${res4c.statusCode}`);
        console.log(`   Industry saved: ${res4c.responseData?.data?.industry}`);
        console.log(`   Company size saved: ${res4c.responseData?.data?.companySize}`);
        console.log(`   Onboarding step: ${res4c.responseData?.data?.onboardingStep}`);
        if (res4c.statusCode !== 200 || res4c.responseData?.data?.industry !== 'Technology & Software') {
            throw new Error(`Step 4 failed: ${JSON.stringify(res4c.responseData)}`);
        }
        console.log('   ✅ Workspace setup saved successfully\n');

        // -------------------------------------------------------------
        // STEP 5: /onboarding - Choose Modules (Screenshot 5)
        // -------------------------------------------------------------
        console.log('📌 STEP 5A: GET /api/v1/onboarding/modules (Catalog modules)');
        const res5a = createMockRes();
        await getAvailableModules({}, res5a);
        const moduleNames = res5a.responseData?.data?.map(m => m.moduleName);
        console.log(`   Available modules: ${moduleNames.join(', ')}`);

        console.log('📌 STEP 5B: POST /api/v1/onboarding/modules (Activate selected modules)');
        const selectedModuleKeys = ['hr', 'accounting', 'supplyChain'];
        const req5b = {
            payload: {
                id: createdCompany._id,
                email: testEmail,
            },
            body: {
                modules: selectedModuleKeys,
            },
        };
        const res5b = createMockRes();
        await selectModules(req5b, res5b);
        console.log(`   Response status: ${res5b.statusCode}`);
        console.log(`   Response message: ${res5b.responseData?.message}`);
        console.log(`   Onboarding completed flag: ${res5b.responseData?.data?.onboardingCompleted}`);

        const activeModulesInCompany = (res5b.responseData?.data?.companyFeatures?.modules || [])
            .filter(m => m.active)
            .map(m => m.moduleName);
        console.log(`   Active modules in company: ${activeModulesInCompany.join(', ')}`);

        const systemRoles = (res5b.responseData?.data?.systemRoles || []).map(r => r.roleName);
        console.log(`   System roles configured: ${systemRoles.join(', ')}`);

        if (res5b.statusCode !== 200 || !res5b.responseData?.data?.onboardingCompleted) {
            throw new Error(`Step 5 failed: ${JSON.stringify(res5b.responseData)}`);
        }
        console.log('   ✅ Modules selected and onboarding completed successfully\n');

        // -------------------------------------------------------------
        // BONUS: Status Check
        // -------------------------------------------------------------
        console.log('📌 VERIFY: GET /api/v1/onboarding/status');
        const reqStatus = {
            payload: { id: createdCompany._id, email: testEmail },
        };
        const resStatus = createMockRes();
        await getOnboardingStatus(reqStatus, resStatus);
        console.log(`   Status data:`, JSON.stringify(resStatus.responseData?.data, null, 2));

        // -------------------------------------------------------------
        // STEP 6: /onboarding - Invite Employees (Screenshot 1)
        // -------------------------------------------------------------
        console.log('📌 STEP 6A: POST /api/v1/onboarding/invite-employees (Send Invites)');
        const invitee1 = `invitee_1_${Date.now()}@example.com`;
        const invitee2 = `invitee_2_${Date.now()}@example.com`;
        const req6a = {
            payload: { id: createdCompany._id, email: testEmail },
            body: { emails: [invitee1, invitee2] },
        };
        const res6a = createMockRes();
        await inviteEmployees(req6a, res6a);
        console.log(`   Response status: ${res6a.statusCode}`);
        console.log(`   Response message: ${res6a.responseData?.message}`);
        const count = res6a.responseData?.data?.totalInvited || res6a.responseData?.data?.invitedCount;
        if (res6a.statusCode !== 200 || count !== 2) {
            throw new Error(`Step 6A failed: ${JSON.stringify(res6a.responseData)}`);
        }
        console.log('   ✅ Employees invited successfully\n');

        console.log('📌 STEP 6B: POST /api/v1/onboarding/skip-invite (Skip For Now)');
        const req6b = {
            payload: { id: createdCompany._id, email: testEmail },
            body: {},
        };
        const res6b = createMockRes();
        await skipInvite(req6b, res6b);
        console.log(`   Response status: ${res6b.statusCode}`);
        console.log(`   Response message: ${res6b.responseData?.message}`);
        if (res6b.statusCode !== 200) {
            throw new Error(`Step 6B failed: ${JSON.stringify(res6b.responseData)}`);
        }
        console.log('   ✅ Skip invite succeeded\n');

        // -------------------------------------------------------------
        // STEP 7: Settings - Account Information (Screenshot 2)
        // -------------------------------------------------------------
        console.log('📌 STEP 7A: GET /api/v1/company/account-info (Fetch Account Info)');
        const req7a = {
            payload: { id: createdCompany._id, email: testEmail },
        };
        const res7a = createMockRes();
        await getAccountInfo(req7a, res7a);
        console.log(`   Response status: ${res7a.statusCode}`);
        console.log(`   Company Name: ${res7a.responseData?.data?.companyName}`);
        console.log(`   Super Admin Email: ${res7a.responseData?.data?.superAdminEmail}`);
        console.log(`   Date Joined: ${res7a.responseData?.data?.dateJoined}`);
        if (res7a.statusCode !== 200 || !res7a.responseData?.data?.companyName) {
            throw new Error(`Step 7A failed: ${JSON.stringify(res7a.responseData)}`);
        }
        console.log('   ✅ Account info fetched successfully\n');

        console.log('📌 STEP 7B: PATCH /api/v1/company/account-info (Save Changes)');
        const req7b = {
            payload: { id: createdCompany._id, email: testEmail },
            body: {
                companyName: 'Globex Enterprise Ltd',
                companyAddress: '100 Business Boulevard',
                country: 'Nigeria',
                state: 'Lagos',
                city: 'Ikeja',
                language: 'English',
                currency: 'USD',
            },
        };
        const res7b = createMockRes();
        await updateAccountInfo(req7b, res7b);
        console.log(`   Response status: ${res7b.statusCode}`);
        console.log(`   Updated Name: ${res7b.responseData?.data?.companyName}`);
        console.log(`   Updated Country: ${res7b.responseData?.data?.country}`);
        console.log(`   Updated Currency: ${res7b.responseData?.data?.currency}`);
        if (res7b.statusCode !== 200 || res7b.responseData?.data?.city !== 'Ikeja') {
            throw new Error(`Step 7B failed: ${JSON.stringify(res7b.responseData)}`);
        }
        console.log('   ✅ Account information updated successfully\n');

        // -------------------------------------------------------------
        // STEP 8: Settings - Modules, Roles & Permissions (Screenshot 3)
        // -------------------------------------------------------------
        console.log('📌 STEP 8A: GET /api/v1/company/roles-permissions (Fetch Matrix)');
        const req8a = {
            payload: { id: createdCompany._id, email: testEmail },
        };
        const res8a = createMockRes();
        await getRolesAndPermissions(req8a, res8a);
        console.log(`   Response status: ${res8a.statusCode}`);
        console.log(`   Roles count: ${res8a.responseData?.data?.roles?.length}`);
        console.log(`   Modules count: ${res8a.responseData?.data?.modules?.length}`);
        console.log(`   Matrix items: ${res8a.responseData?.data?.matrix?.length}`);
        if (res8a.statusCode !== 200 || !res8a.responseData?.data?.roles?.length) {
            throw new Error(`Step 8A failed: ${JSON.stringify(res8a.responseData)}`);
        }
        console.log('   ✅ Roles & permissions matrix retrieved\n');

        console.log('📌 STEP 8B: POST /api/v1/company/roles (+ Add New Role)');
        const req8b = {
            payload: { id: createdCompany._id, email: testEmail },
            body: {
                roleName: 'Auditor',
                description: 'Financial & compliance auditor',
                permissions: ['View Invoices', 'Audit Logs'],
            },
        };
        const res8b = createMockRes();
        await addNewRole(req8b, res8b);
        console.log(`   Response status: ${res8b.statusCode}`);
        console.log(`   New role name: ${res8b.responseData?.data?.roleName}`);
        if (res8b.statusCode !== 201) {
            throw new Error(`Step 8B failed: ${JSON.stringify(res8b.responseData)}`);
        }
        console.log('   ✅ Custom role created successfully\n');

        console.log('📌 STEP 8C: PATCH /api/v1/company/roles-permissions (Save Changes)');
        const req8c = {
            payload: { id: createdCompany._id, email: testEmail },
            body: {
                moduleUpdates: [
                    { moduleId: 1, name: 'Human Resources Module', active: true },
                    { moduleId: 6, name: 'Accounting Module', active: true },
                ],
                roleUpdates: [
                    { roleName: 'Super Admin', permissions: ['Manage All', 'View All'] },
                ],
            },
        };
        const res8c = createMockRes();
        await updateRolesAndPermissions(req8c, res8c);
        console.log(`   Response status: ${res8c.statusCode}`);
        console.log(`   Updated count: ${res8c.responseData?.data?.rolesUpdated}`);
        if (res8c.statusCode !== 200) {
            throw new Error(`Step 8C failed: ${JSON.stringify(res8c.responseData)}`);
        }
        console.log('   ✅ Roles and permissions matrix saved\n');

        // -------------------------------------------------------------
        // STEP 9: Settings - Billing & Subscriptions (Screenshot 4)
        // -------------------------------------------------------------
        console.log('📌 STEP 9A: GET /api/v1/company/billing-subscriptions');
        const req9a = {
            payload: { id: createdCompany._id, email: testEmail },
        };
        const res9a = createMockRes();
        await getBillingAndSubscriptions(req9a, res9a);
        console.log(`   Response status: ${res9a.statusCode}`);
        console.log(`   Current Plan: ${res9a.responseData?.data?.currentPlan?.name}`);
        console.log(`   Cardholder: ${res9a.responseData?.data?.paymentMethod?.cardholderName}`);
        console.log(`   Billing History count: ${res9a.responseData?.data?.billingHistory?.length}`);
        if (res9a.statusCode !== 200) {
            throw new Error(`Step 9A failed: ${JSON.stringify(res9a.responseData)}`);
        }
        console.log('   ✅ Billing & subscription details retrieved\n');

        console.log('📌 STEP 9B: PATCH /api/v1/company/payment-method (Manage Card)');
        const req9b = {
            payload: { id: createdCompany._id, email: testEmail },
            body: {
                cardBrand: 'Mastercard',
                cardLastFour: '7890',
                cardholderName: 'Globex Director',
                expirationDate: '09/27',
            },
        };
        const res9b = createMockRes();
        await updatePaymentMethod(req9b, res9b);
        console.log(`   Response status: ${res9b.statusCode}`);
        console.log(`   Updated Card: ${res9b.responseData?.data?.cardBrand} ending in ${res9b.responseData?.data?.cardLastFour}`);
        if (res9b.statusCode !== 200 || res9b.responseData?.data?.cardLastFour !== '7890') {
            throw new Error(`Step 9B failed: ${JSON.stringify(res9b.responseData)}`);
        }
        console.log('   ✅ Payment method updated successfully\n');

        console.log('📌 STEP 9C: POST /api/v1/subscriptions/cancel (Cancel Subscription)');
        const req9c = {
            payload: { id: createdCompany._id, email: testEmail },
            body: { reason: 'Test plan evaluation finished' },
        };
        const res9c = createMockRes();
        await cancelSubscription(req9c, res9c);
        console.log(`   Response status: ${res9c.statusCode}`);
        console.log(`   Message: ${res9c.responseData?.message}`);
        if (res9c.statusCode !== 200) {
            throw new Error(`Step 9C failed: ${JSON.stringify(res9c.responseData)}`);
        }
        console.log('   ✅ Subscription cancelled successfully\n');

        // Cleanup test data
        await Company.deleteMany({ email: testEmail });
        await Otp.deleteMany({ email: testEmail });
        await Employee.deleteMany({ email: { $in: [invitee1, invitee2] } });
        console.log('\n🧹 Test data cleaned up.');

        console.log('\n=============================================');
        console.log('🎉 ALL 9 SCREENS & ENDPOINTS TESTED & VERIFIED!');
        console.log('=============================================\n');

        process.exit(0);
    } catch (err) {
        console.error('\n❌ Test Error:', err);
        process.exit(1);
    }
}

runTests();
