import mongoose from 'mongoose';
import { Service } from '../models/Service';
import { Booking } from '../models/Booking';
import { Client } from '../models/Client';
import { ServiceProvider } from '../models/ServiceProvider';
import { ProviderPrivateData } from '../models/ProviderPrivateData';
import { Review } from '../models/Review';
import { Notification } from '../models/Notification';
import { config } from '../config/env';

// Sample data for all collections
const sampleServices = [
  {
    name: "Appliance Repair",
    description: "Professional repair services for all household appliances including refrigerators, washing machines, dryers, and more.",
    baseFee: 75,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"
  },
  {
    name: "Carpentry",
    description: "Expert woodworking and carpentry services for furniture repair, custom installations, and home improvements.",
    baseFee: 60,
    imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop"
  },
  {
    name: "Cleaning",
    description: "Comprehensive cleaning services for homes and offices including deep cleaning, regular maintenance, and post-construction cleanup.",
    baseFee: 50,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"
  },
  {
    name: "Electrical",
    description: "Licensed electrical services for installations, repairs, maintenance, and safety inspections.",
    baseFee: 80,
    imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop"
  },
  {
    name: "Gardening",
    description: "Professional gardening and landscaping services including lawn care, tree trimming, and garden design.",
    baseFee: 45,
    imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=400&fit=crop"
  },
  {
    name: "Home Repair",
    description: "General home repair and maintenance services for all types of household issues and improvements.",
    baseFee: 65,
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop"
  },
  {
    name: "Painting",
    description: "Professional painting services for interior and exterior projects with quality materials and expert finishes.",
    baseFee: 55,
    imageUrl: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=400&fit=crop"
  },
  {
    name: "Plumbing",
    description: "Expert plumbing services for repairs, installations, maintenance, and emergency plumbing issues.",
    baseFee: 70,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"
  },
  {
    name: "Roofing",
    description: "Professional roofing services including repairs, installations, maintenance, and inspections.",
    baseFee: 100,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"
  },
  {
    name: "Window Cleaning",
    description: "Professional window cleaning services for residential and commercial properties.",
    baseFee: 40,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"
  },
  {
    name: "Pest Control",
    description: "Comprehensive pest control services for residential and commercial properties.",
    baseFee: 85,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"
  },
  // Adding missing services to match ServiceCatalog
  {
    name: "HVAC",
    description: "Heating, ventilation, and air conditioning services including installation, repair, and maintenance.",
    baseFee: 90,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"
  },
  {
    name: "Security",
    description: "Security system installation and maintenance including locks, alarms, and surveillance systems.",
    baseFee: 95,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"
  },
  {
    name: "Landscaping",
    description: "Professional landscaping services including design, installation, and maintenance of outdoor spaces.",
    baseFee: 70,
    imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=400&fit=crop"
  },
  {
    name: "Renovation",
    description: "Complete home renovation and remodeling services for all types of projects.",
    baseFee: 120,
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop"
  }
];

const sampleClients = [
  {
    userId: "client_001",
    username: "johnsmith",
    email: "john.smith@example.com",
    name: "John Smith",
    mobileNumber: "+1234567890",
    address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001"
    },
    location: "Manhattan",
    rating: 4.5
  },
  {
    userId: "client_002",
    username: "sarahjohnson",
    email: "sarah.johnson@example.com",
    name: "Samanthi Fonseka",
    mobileNumber: "+1234567891",
    address: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210"
    },
    location: "Beverly Hills",
    rating: 4.8
  },
  {
    userId: "client_003",
    username: "mikedavis",
    email: "mike.davis@example.com",
    name: "Mike Davis",
    mobileNumber: "+1234567892",
    address: {
      street: "789 Pine Rd",
      city: "Chicago",
      state: "IL",
      zipCode: "60601"
    },
    location: "Downtown",
    rating: 4.2
  },
  {
    userId: "client_004",
    username: "emilywilson",
    email: "emily.wilson@example.com",
    name: "Emily Wilson",
    mobileNumber: "+1234567893",
    address: {
      street: "321 Elm St",
      city: "Houston",
      state: "TX",
      zipCode: "77001"
    },
    location: "Midtown",
    rating: 4.7
  },
  {
    userId: "client_005",
    username: "davidbrown",
    email: "david.brown@example.com",
    name: "David Brown",
    mobileNumber: "+1234567894",
    address: {
      street: "654 Maple Dr",
      city: "Phoenix",
      state: "AZ",
      zipCode: "85001"
    },
    location: "Central",
    rating: 4.4
  }
];

const sampleProviders = [
  {
    userId: "provider_001",
    name: "Sapumal Chandrasiri",
    serviceIds: [], // Will be populated with service IDs
    experience: "5+ years",
    rating: 4.8,
    location: {
      city: "New York",
      area: "Manhattan"
    },
    skills: ["Electrical", "Plumbing", "Home Repair"],
    bio: "Experienced handyman with expertise in electrical and plumbing work.",
    doneJobsCount: 0,
    availability: {
      mon: ["9am-5pm"],
      tue: ["9am-5pm"],
      wed: ["9am-5pm"],
      thu: ["9am-5pm"],
      fri: ["9am-5pm"]
    }
  },
  {
    userId: "provider_002",
    name: "Udayanga Perera",
    serviceIds: [],
    experience: "3+ years",
    rating: 4.6,
    location: {
      city: "Los Angeles",
      area: "Beverly Hills"
    },
    skills: ["Cleaning", "Gardening", "Painting"],
    bio: "Professional cleaner and gardener with attention to detail.",
    doneJobsCount: 0,
    availability: {
      mon: ["8am-4pm"],
      tue: ["8am-4pm"],
      wed: ["8am-4pm"],
      thu: ["8am-4pm"],
      fri: ["8am-4pm"]
    }
  },
  {
    userId: "provider_003",
    name: "Nimal Basnayake",
    serviceIds: [],
    experience: "7+ years",
    rating: 4.9,
    location: {
      city: "Chicago",
      area: "Downtown"
    },
    skills: ["Carpentry", "Home Repair", "Roofing"],
    bio: "Master carpenter with extensive experience in home renovations.",
    doneJobsCount: 0,
    availability: {
      mon: ["7am-6pm"],
      tue: ["7am-6pm"],
      wed: ["7am-6pm"],
      thu: ["7am-6pm"],
      fri: ["7am-6pm"]
    }
  },
  {
    userId: "provider_004",
    name: "Piyal Alahakon",
    serviceIds: [],
    experience: "4+ years",
    rating: 4.5,
    location: {
      city: "Houston",
      area: "Midtown"
    },
    skills: ["Plumbing", "Electrical", "Appliance Repair"],
    bio: "Licensed plumber and electrician with emergency service availability.",
    doneJobsCount: 0,
    availability: {
      mon: ["8am-8pm"],
      tue: ["8am-8pm"],
      wed: ["8am-8pm"],
      thu: ["8am-8pm"],
      fri: ["8am-8pm"],
      sat: ["9am-5pm"]
    }
  },
  {
    userId: "provider_005",
    name: "Kamal Silva",
    serviceIds: [],
    experience: "6+ years",
    rating: 4.7,
    location: {
      city: "Phoenix",
      area: "Central"
    },
    skills: ["Painting", "Window Cleaning", "Pest Control"],
    bio: "Professional painter and window cleaner with eco-friendly solutions.",
    doneJobsCount: 0,
    availability: {
      mon: ["9am-6pm"],
      tue: ["9am-6pm"],
      wed: ["9am-6pm"],
      thu: ["9am-6pm"],
      fri: ["9am-6pm"]
    }
  }
];

const seedAllData = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear all collections
    console.log('🧹 Clearing existing data...');
    await Service.deleteMany({});
    await Client.deleteMany({});
    await ServiceProvider.deleteMany({});
    await ProviderPrivateData.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});

    // 1. Seed Services
    console.log('📦 Seeding services...');
    const insertedServices = await Service.insertMany(sampleServices);
    console.log(`✅ Seeded ${insertedServices.length} services`);

    // 2. Seed Clients
    console.log('👥 Seeding clients...');
    const insertedClients = await Client.insertMany(sampleClients);
    console.log(`✅ Seeded ${insertedClients.length} clients`);

    // 3. Seed Service Providers (with service IDs)
    console.log('🔧 Seeding service providers...');
    const serviceIds = insertedServices.map(service => (service._id as any).toString());
    
    const providersWithServices = sampleProviders.map((provider, index) => ({
      ...provider,
      serviceIds: serviceIds.slice(index * 2, (index + 1) * 2) // Each provider gets 2 services
    }));

    const insertedProviders = await ServiceProvider.insertMany(providersWithServices);
    console.log(`✅ Seeded ${insertedProviders.length} service providers`);

    // 4. Seed Provider Private Data
    console.log('💰 Seeding provider private data...');
    const providerNames = [
      "Sapumal Chandrasiri",
      "Udayanga Perera", 
      "Nimal Basnayake",
      "Piyal Alahakon",
      "Kamal Silva"
    ];
    
    const providerPrivateData = insertedProviders.map((provider, index) => ({
      userId: provider.userId,
      name: providerNames[index] || `Provider ${index + 1}`,
      nic: `NIC${String(index + 1).padStart(3, '0')}`,
      contactNumber: `+94${Math.floor(Math.random() * 90000000) + 10000000}`,
      emailAddress: `provider${index + 1}@example.com`,
      personalPhoto: "https://via.placeholder.com/150",
      skills: provider.skills || [],
      experience: parseInt(provider.experience) || 5,
      certifications: ["Professional Certification"],
      services: provider.serviceIds || [],
      address: {
        street: `${index + 1} Main Street`,
        city: provider.location.city,
        state: provider.location.area,
        zipCode: "10000"
      },
      availability: {
        workingDays: "Monday to Friday",
        workingHours: "9 AM to 6 PM"
      },
      paymentMethod: "Bank Transfer",
      totalEarnings: Math.floor(Math.random() * 5000) + 1000,
      upcomingBookings: [],
      schedule: {},
      notifications: [],
      oldBookings: []
    }));

    await ProviderPrivateData.insertMany(providerPrivateData);
    console.log(`✅ Seeded ${providerPrivateData.length} provider private data records`);

    // 5. Seed Bookings (with various statuses)
    console.log('📅 Seeding bookings...');
    const bookings = [];
    const statuses = ['pending', 'confirmed', 'done', 'cancelled'];
    
    for (let i = 0; i < 50; i++) {
      const randomService = insertedServices[Math.floor(Math.random() * insertedServices.length)];
      const randomClient = insertedClients[Math.floor(Math.random() * insertedClients.length)];
      const randomProvider = insertedProviders[Math.floor(Math.random() * insertedProviders.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      const booking = {
        status: randomStatus,
        description: `Service request for ${randomService.name}`,
        fee: randomStatus === 'done' ? randomService.baseFee + Math.floor(Math.random() * 50) : null,
        location: {
          address: randomClient.address.street,
          coordinates: {
            lat: 40.7128 + (Math.random() - 0.5) * 0.1,
            lng: -74.0060 + (Math.random() - 0.5) * 0.1
          }
        },
        clientId: randomClient.userId,
        providerId: randomProvider.userId,
        serviceId: randomService._id,
        serviceName: randomService.name, // Add required serviceName field
        providerName: randomProvider.name, // Add required providerName field
        scheduledTime: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in next 30 days
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Random date in last 90 days
      };
      
      bookings.push(booking);
    }

    const insertedBookings = await Booking.insertMany(bookings);
    console.log(`✅ Seeded ${insertedBookings.length} bookings`);

    // 6. Calculate and update service usage counts
    console.log('📊 Calculating service usage counts...');
    const serviceUsageCounts = await Booking.aggregate([
      { $match: { status: 'done' } },
      { $group: { _id: '$serviceId', count: { $sum: 1 } } }
    ]);

    for (const usage of serviceUsageCounts) {
      await Service.findByIdAndUpdate(usage._id, { usageCount: usage.count });
    }
    console.log(`✅ Updated usage counts for ${serviceUsageCounts.length} services`);

    // 7. Seed Reviews
    console.log('⭐ Seeding reviews...');
    const reviews = [];
    const doneBookings = insertedBookings.filter(booking => booking.status === 'done');
    
    for (const booking of doneBookings.slice(0, 20)) { // Create reviews for first 20 done bookings
      const review = {
        bookingId: booking._id,
        from: booking.clientId,
        to: booking.providerId,
        rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
        comment: `Great service! The ${insertedServices.find(s => (s._id as any).toString() === (booking.serviceId as any).toString())?.name} was completed professionally.`,
        createdAt: new Date(booking.createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) // Within a week of booking
      };
      reviews.push(review);
    }

    await Review.insertMany(reviews);
    console.log(`✅ Seeded ${reviews.length} reviews`);

    // 8. Seed Notifications
    console.log('🔔 Seeding notifications...');
    const notifications = [];
    const allUsers = [...insertedClients.map(c => c.userId), ...insertedProviders.map(p => p.userId)];
    
    for (const userId of allUsers) {
      const userNotifications = [
        {
          userId,
          title: "Welcome to FIXFINDER!",
          message: "Thank you for joining our platform. We're here to help you with all your service needs.",
          read: true,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        },
        {
          userId,
          title: "New Service Available",
          message: "Check out our latest services and find the perfect match for your needs.",
          read: false,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        }
      ];
      notifications.push(...userNotifications);
    }

    await Notification.insertMany(notifications);
    console.log(`✅ Seeded ${notifications.length} notifications`);

    // 9. Update provider stats based on bookings
    console.log('📈 Updating provider statistics...');
    const providerStats = await Booking.aggregate([
      { $match: { status: 'done' } },
      { $group: { _id: '$providerId', totalEarnings: { $sum: '$fee' }, doneJobs: { $sum: 1 } } }
    ]);

    for (const stat of providerStats) {
      await ServiceProvider.findOneAndUpdate(
        { userId: stat._id },
        { doneJobsCount: stat.doneJobs }
      );
      await ProviderPrivateData.findOneAndUpdate(
        { userId: stat._id },
        { totalEarnings: stat.totalEarnings }
      );
    }
    console.log(`✅ Updated statistics for ${providerStats.length} providers`);

    // Display summary
    console.log('\n🎉 All data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Services: ${insertedServices.length}`);
    console.log(`- Clients: ${insertedClients.length}`);
    console.log(`- Service Providers: ${insertedProviders.length}`);
    console.log(`- Bookings: ${insertedBookings.length}`);
    console.log(`- Reviews: ${reviews.length}`);
    console.log(`- Notifications: ${notifications.length}`);
    
    console.log('\n📈 Service Usage Counts:');
    const servicesWithUsage = await Service.find({}, 'name usageCount');
    servicesWithUsage.forEach(service => {
      console.log(`- ${service.name}: ${service.usageCount} times used`);
    });

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run the seed function
seedAllData(); 