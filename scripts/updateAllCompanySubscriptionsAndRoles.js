const mongoose = require('../dist/node_modules/mongoose');
require('dotenv').config();

const url = process.env.MONGO_URL;

async function runMigration() {
    if (!url) {
        console.error('MONGO_URL environment variable is not defined.');
        process.exit(1);
    }

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(url, {
            family: 4,
            serverSelectionTimeoutMS: 15000,
        });
        console.log('Connected to MongoDB successfully.');

        // Load models using dist mongoose
        const Company = require('../dist/model/Company');
        const Subscription = require('../dist/model/Subscriptions');

        const companies = await Company.find({});
        console.log(`Found ${companies.length} company accounts to process.`);

        const now = new Date();
        let updatedCount = 0;

        for (const company of companies) {
            console.log(`\n----------------------------------------------`);
            console.log(`Processing Company: "${company.companyName || 'Unnamed'}" (${company.email || company._id})`);

            // 1. UPDATE ROLES AND PERMISSIONS
            // Manager and Staff should have NO permissions checked by default (value: false)
            // Super Admin retains all permissions (value: true)
            if (Array.isArray(company.systemRoles) && company.systemRoles.length > 0) {
                let permissionsResetCount = 0;
                company.systemRoles.forEach(role => {
                    const isSuperAdmin = role.roleName === 'Super Admin';
                    const isManagerOrStaff = role.roleName === 'Manager' || role.roleName === 'Staff';

                    if (isManagerOrStaff) {
                        (role.rolePermissions || []).forEach(mod => {
                            (mod.moduleFeatures || []).forEach(feat => {
                                (feat.featurePermissions || []).forEach(perm => {
                                    perm.value = false;
                                    permissionsResetCount++;
                                });
                            });
                        });
                    } else if (isSuperAdmin) {
                        (role.rolePermissions || []).forEach(mod => {
                            (mod.moduleFeatures || []).forEach(feat => {
                                (feat.featurePermissions || []).forEach(perm => {
                                    perm.value = true;
                                });
                            });
                        });
                    }
                });
                company.markModified('systemRoles');
                console.log(`  ✓ System roles updated: Reset ${permissionsResetCount} permission checkboxes on Manager/Staff to false.`);
            }

            // 2. UPDATE SUBSCRIPTION TO 14-DAY FREE TRIAL
            const accountCreated = company.createdAt || company.dateCreated || new Date();
            const trialExpiry = new Date(new Date(accountCreated).getTime() + 14 * 24 * 60 * 60 * 1000);
            const isTrialActive = now <= trialExpiry;

            // Check existing subscriptions for this company
            const existingSubs = await Subscription.find({ companyId: String(company._id) });
            const hasPaidSub = existingSubs.some(s => 
                !s.subscriptionPlan.toLowerCase().includes('trial') && (s.status === 'active' || s.status === 'pending')
            );

            if (!hasPaidSub) {
                // Delete existing trial/dummy subscriptions to prevent stale duplicates
                await Subscription.deleteMany({ companyId: String(company._id) });

                // Create fresh Free Trial subscription
                await Subscription.create({
                    companyName: company.companyName || 'Company',
                    email: company.email,
                    companyId: String(company._id),
                    subscriptionPlan: 'Free Trial',
                    price: 0,
                    unitPrice: 0,
                    subscriptionCycle: 'biweekly',
                    startDate: accountCreated,
                    endDate: trialExpiry,
                    status: isTrialActive ? 'active' : 'expired',
                    userRange: '1-10',
                    modules: (company.companyFeatures?.modules || []).map((m, idx) => ({
                        moduleId: m.moduleId || idx + 1,
                        key: m.key,
                        moduleName: m.moduleName,
                        value: m.value || m.key,
                    })),
                });

                if (!company.companyFeatures) company.companyFeatures = {};
                company.companyFeatures.subscriptionStatus = {
                    isActive: isTrialActive,
                    plan: 'Free Trial',
                    currentCycle: '14 Days',
                    startDate: accountCreated,
                    endDate: trialExpiry,
                };
                company.markModified('companyFeatures');
                console.log(`  ✓ Subscription updated: Free Trial (${isTrialActive ? 'Active' : 'Expired'}), Started: ${accountCreated.toISOString().slice(0, 10)}, Expiry: ${trialExpiry.toISOString().slice(0, 10)}`);
            } else {
                console.log(`  ✓ Company has paid subscription; preserved existing paid active/pending plans.`);
            }

            await company.save();
            updatedCount++;
        }

        console.log(`\n==============================================`);
        console.log(`Successfully updated ${updatedCount} company accounts!`);
        console.log(`==============================================\n`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

runMigration();
