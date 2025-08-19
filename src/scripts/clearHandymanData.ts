import mongoose from 'mongoose';
import { config } from '../config/env';
import { ProviderPrivateData } from '../models/ProviderPrivateData';
import { ServiceProvider } from '../models/ServiceProvider';

async function clearHandymanData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear ProviderPrivateData collection
    const deletedPrivateData = await ProviderPrivateData.deleteMany({});
    console.log(`🗑️  Deleted ${deletedPrivateData.deletedCount} ProviderPrivateData records`);

    // Clear ServiceProvider collection
    const deletedServiceProviders = await ServiceProvider.deleteMany({});
    console.log(`🗑️  Deleted ${deletedServiceProviders.deletedCount} ServiceProvider records`);

    console.log('✅ Handyman data cleared successfully!');
    console.log('💡 You can now test handyman registration again');

  } catch (error) {
    console.error('❌ Error clearing handyman data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
clearHandymanData();
