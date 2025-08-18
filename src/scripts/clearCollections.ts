import mongoose from 'mongoose';
import { ServiceProvider } from '../models/ServiceProvider';
import { ProviderPrivateData } from '../models/ProviderPrivateData';
import { config } from '../config/env';

const clearCollections = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear serviceproviders collection
    const serviceProvidersResult = await ServiceProvider.deleteMany({});
    console.log(`🗑️  Deleted ${serviceProvidersResult.deletedCount} documents from serviceproviders collection`);

    // Clear providerprivatedatas collection
    const providerPrivateDataResult = await ProviderPrivateData.deleteMany({});
    console.log(`🗑️  Deleted ${providerPrivateDataResult.deletedCount} documents from providerprivatedatas collection`);

    console.log('✅ All data cleared successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Run: npm run seed:all (to seed initial data)');
    console.log('   2. Run: npm run seed:providers (to add more service providers)');

  } catch (error) {
    console.error('❌ Error clearing collections:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

clearCollections();
