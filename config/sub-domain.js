const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const amplify = new AWS.Amplify();

const createSubdomainForAmplifyApp =  async (subDomainName) => {
  try {
    let domainName = process.env.DOMAIN_NAME;
    let appId = process.env.AMPLIFY_APP_ID;

    // First, check if the domain is already associated.
    const listParams = { appId };
    const domains = await amplify.listDomainAssociations(listParams).promise();
    console.log('Existing domain associations:', JSON.stringify(domains, null, 2));

    let domainAssociation = domains.domainAssociations.find(d => d.domainName === domainName);

    if (!domainAssociation) {
      throw new Error('Domain association not found. Please associate the main domain with the Amplify app first.');
    }

    // Prepare the subDomainSettings.
    const existingSubDomains = domainAssociation.subDomains || [];
    const newSubDomain = {
      prefix: subDomainName,
      branchName: 'main'
    };

    // Check if the subdomain already exists.
    const subDomainExists = existingSubDomains.some(sd => sd.subDomainSetting.prefix === subDomainName);

    if (subDomainExists) {
      console.log(`Subdomain ${subDomainName} already exists.`);
      return {
        message: `Subdomain ${subDomainName} already exists.`,
        subDomain: newSubDomain
      };
    }

    // Update the domain association to add the new subdomain.
    const updateParams = {
      appId: appId,
      domainName: domainName,
      subDomainSettings: [
        ...existingSubDomains
          .map(sd => ({
            prefix: sd.subDomainSetting.prefix || '',  // Use empty string if prefix is null
            branchName: sd.subDomainSetting.branchName
          }))
          .filter(sd => sd.prefix !== ''),  // Remove any entries with empty prefix
        newSubDomain
      ]
    };

    const result = await amplify.updateDomainAssociation(updateParams).promise();
    console.log(`Subdomain ${subDomainName}.${domainName} created successfully for Amplify app ${appId}`);
    console.log('Update result:', JSON.stringify(result, null, 2));

    return newSubDomain;
    
  } catch (error) {
    console.error('Error creating subdomain for Amplify app:', error);
    throw error;
  }
}

export default createSubdomainForAmplifyApp;