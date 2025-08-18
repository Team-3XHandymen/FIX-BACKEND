import mongoose from 'mongoose';
import { config } from '../config/env';
import { connectDB } from '../config/database';
import { Booking } from '../models/Booking';
import { ServiceProvider } from '../models/ServiceProvider';
import { Service } from '../models/Service';

async function migrateBookings() {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Get all existing bookings
    const bookings = await Booking.find({});
    console.log(`Found ${bookings.length} bookings to migrate`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const booking of bookings) {
      try {
        // Skip if already has the new fields
        if (booking.providerName && booking.serviceName) {
          console.log(`Booking ${booking._id} already migrated, skipping`);
          continue;
        }

        // Get provider name
        const provider = await ServiceProvider.findOne({ userId: booking.providerId });
        if (!provider) {
          console.log(`Provider not found for booking ${booking._id}, providerId: ${booking.providerId}`);
          errorCount++;
          continue;
        }

        // Get service name
        const service = await Service.findById(booking.serviceId);
        if (!service) {
          console.log(`Service not found for booking ${booking._id}, serviceId: ${booking.serviceId}`);
          errorCount++;
          continue;
        }

        // Update the booking
        await Booking.findByIdAndUpdate(booking._id, {
          providerName: provider.name,
          serviceName: service.name
        });

        console.log(`Updated booking ${booking._id}: provider=${provider.name}, service=${service.name}`);
        updatedCount++;

      } catch (error) {
        console.error(`Error updating booking ${booking._id}:`, error);
        errorCount++;
      }
    }

    console.log('\nMigration completed!');
    console.log(`Updated: ${updatedCount} bookings`);
    console.log(`Errors: ${errorCount} bookings`);
    console.log(`Total processed: ${bookings.length} bookings`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateBookings();
}

export { migrateBookings };
