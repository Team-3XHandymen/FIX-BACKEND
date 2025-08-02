import mongoose from 'mongoose';
import { Service } from '../models/Service';
import { config } from '../config/env';

const sampleServices = [
  {
    name: "Appliance Repair",
    description: "Professional repair services for all household appliances including refrigerators, washing machines, dryers, and more.",
    baseFee: 75,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"
  },
  {
    name: "Carpentry",
    description: "Expert carpentry services for furniture repair, custom woodwork, and home improvements.",
    baseFee: 60,
    imageUrl: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&h=400&fit=crop"
  },
  {
    name: "Cleaning",
    description: "Comprehensive cleaning services for homes and offices including deep cleaning and regular maintenance.",
    baseFee: 50,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"
  },
  {
    name: "Electrical",
    description: "Licensed electrical services for installations, repairs, and safety inspections.",
    baseFee: 80,
    imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop"
  },
  {
    name: "Gardening",
    description: "Professional gardening and landscaping services to maintain and beautify your outdoor spaces.",
    baseFee: 45,
    imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop"
  },
  {
    name: "Home Repair",
    description: "General home repair and maintenance services for all types of household issues.",
    baseFee: 65,
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop"
  },
  {
    name: "Painting",
    description: "Interior and exterior painting services with professional finish and quality materials.",
    baseFee: 55,
    imageUrl: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=400&fit=crop"
  },
  {
    name: "Pest Control",
    description: "Effective pest control and extermination services to keep your home pest-free.",
    baseFee: 90,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"
  },
  {
    name: "Plumbing",
    description: "Expert plumbing services for repairs, installations, and emergency plumbing issues.",
    baseFee: 70,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"
  },
  {
    name: "Roofing",
    description: "Professional roofing services including repairs, maintenance, and new installations.",
    baseFee: 100,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"
  },
  {
    name: "Window Cleaning",
    description: "Professional window cleaning services for residential and commercial properties.",
    baseFee: 40,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"
  }
];

const seedServices = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing services
    await Service.deleteMany({});
    console.log('Cleared existing services');

    // Insert sample services
    const insertedServices = await Service.insertMany(sampleServices);
    console.log(`Successfully seeded ${insertedServices.length} services`);

    // Display the services
    console.log('\nSeeded Services:');
    insertedServices.forEach(service => {
      console.log(`- ${service.name}: $${service.baseFee}`);
    });

    console.log('\n✅ Services seeded successfully!');
  } catch (error) {
    console.error('Error seeding services:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedServices(); 