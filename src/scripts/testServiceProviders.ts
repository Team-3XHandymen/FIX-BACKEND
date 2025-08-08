import mongoose from 'mongoose';
import { Service } from '../models/Service';
import { ServiceProvider } from '../models/ServiceProvider';
import { ProviderPrivateData } from '../models/ProviderPrivateData';
import { config } from '../config/env';

const testServiceProviders = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all services
    const services = await Service.find({}, '_id name');
    console.log('\n📦 Available Services:');
    services.forEach(service => {
      console.log(`- ${service.name} (ID: ${(service as any)._id.toString()})`);
    });

    // Test with Electrical service ID specifically
    const electricalServiceId = '6895c18a426b7393c5147189';
    console.log(`\n🔍 Testing with Electrical service ID: ${electricalServiceId}`);

    // Find service providers that offer this service
    const serviceProviders = await ServiceProvider.find({
      serviceIds: electricalServiceId
    });

    console.log(`\n🔧 Found ${serviceProviders.length} service providers for Electrical service`);

    if (serviceProviders.length === 0) {
      console.log('❌ No service providers found for this service');
      return;
    }

    // Get the user IDs of these service providers
    const userIds = serviceProviders.map(provider => provider.userId);

    // Get the private data (names, etc.) for these providers
    const providerPrivateData = await ProviderPrivateData.find({
      userId: { $in: userIds }
    });

    // Get all services to map service IDs to service names
    const allServices = await Service.find({}, '_id name');
    const serviceMap = new Map(allServices.map(service => [(service._id as any).toString(), service.name]));

    console.log('\n👥 Service Providers Details:');
    serviceProviders.forEach((provider, index) => {
      const privateData = providerPrivateData.find(p => p.userId === provider.userId);
      
      // Get service names for this provider
      const serviceNames = provider.serviceIds
        .map(serviceId => serviceMap.get(serviceId.toString()))
        .filter(Boolean);
      
      console.log(`\n${index + 1}. Provider: ${privateData?.name || 'Unknown Provider'}`);
      console.log(`   User ID: ${provider.userId}`);
      console.log(`   Service IDs: ${provider.serviceIds.join(', ')}`);
      console.log(`   Services: ${serviceNames.join(', ')}`);
      console.log(`   Skills (old): ${provider.skills?.join(', ') || 'None'}`);
      console.log(`   Experience: ${provider.experience}`);
      console.log(`   Rating: ${provider.rating}`);
      console.log(`   Jobs Completed: ${provider.doneJobsCount}`);
      console.log(`   Location: ${provider.location.city}, ${provider.location.area}`);
    });

  } catch (error) {
    console.error('❌ Error testing service providers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
};

testServiceProviders();
