import mongoose from 'mongoose';
import { config } from '../config/env';
import { connectDB } from '../config/database';
import { Booking } from '../models/Booking';

async function addStatusHistoryToBookings() {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Get all existing bookings
    const bookings = await Booking.find({});
    console.log(`Found ${bookings.length} bookings to migrate`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const booking of bookings) {
      try {
        // Skip if already has status change history
        if (booking.statusChangeHistory && booking.statusChangeHistory.length > 0) {
          console.log(`Booking ${booking._id} already has status history, skipping`);
          skippedCount++;
          continue;
        }

        // Add initial status to history
        await Booking.findByIdAndUpdate(booking._id, {
          $set: {
            statusChangeHistory: [{
              status: booking.status,
              changedAt: booking.createdAt || new Date(),
              changedBy: 'client', // Assume initial creation by client
            }],
          },
        });

        console.log(`Added status history to booking ${booking._id}`);
        updatedCount++;

      } catch (error) {
        console.error(`Error updating booking ${booking._id}:`, error);
        errorCount++;
      }
    }

    console.log('\nMigration completed!');
    console.log(`Updated: ${updatedCount} bookings`);
    console.log(`Skipped: ${skippedCount} bookings`);
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
  addStatusHistoryToBookings();
}

export { addStatusHistoryToBookings };

