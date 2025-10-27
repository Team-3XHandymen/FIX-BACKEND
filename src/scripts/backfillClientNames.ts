import mongoose from 'mongoose';
import { Booking } from '../models/Booking';
import { Client } from '../models/Client';
import dotenv from 'dotenv';

dotenv.config();

async function backfillClientNames() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all bookings without clientName
    const bookings = await Booking.find({ $or: [{ clientName: { $exists: false } }, { clientName: '' }] });
    console.log(`📊 Found ${bookings.length} bookings without clientName`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const booking of bookings) {
      try {
        // Get client by their userId
        const client = await Client.findOne({ userId: booking.clientId });
        
        if (client) {
          const clientName = client.name || client.username || 'Client';
          
          await Booking.findByIdAndUpdate(booking._id, {
            $set: { clientName }
          });
          
          updatedCount++;
          console.log(`✅ Updated booking ${booking._id} with clientName: ${clientName}`);
        } else {
          skippedCount++;
          console.log(`⚠️  Client not found for booking ${booking._id} (userId: ${booking.clientId})`);
        }
      } catch (error) {
        console.error(`❌ Error updating booking ${booking._id}:`, error);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully updated: ${updatedCount} bookings`);
    console.log(`⚠️  Skipped (client not found): ${skippedCount} bookings`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

// Run the migration
backfillClientNames();

