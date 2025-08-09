import mongoose from 'mongoose';
import { Service } from '../models/Service';
import { ServiceProvider } from '../models/ServiceProvider';
import { ProviderPrivateData } from '../models/ProviderPrivateData';
import { config } from '../config/env';

const additionalProviders = [
  {
    userId: "provider_006",
    serviceIds: [], // Will be populated with service IDs
    experience: "2+ years",
    rating: 4.2,
    location: {
      city: "New York",
      area: "Brooklyn"
    },
    skills: ["Cleaning", "Gardening"],
    bio: "Reliable cleaner and gardener with attention to detail and eco-friendly practices.",
    doneJobsCount: 45,
    availability: {
      mon: ["8am-4pm"],
      tue: ["8am-4pm"],
      wed: ["8am-4pm"],
      thu: ["8am-4pm"],
      fri: ["8am-4pm"]
    }
  },
  {
    userId: "provider_007",
    serviceIds: [],
    experience: "10+ years",
    rating: 4.9,
    location: {
      city: "New York",
      area: "Queens"
    },
    skills: ["Electrical", "Plumbing", "Home Repair"],
    bio: "Master electrician and plumber with over a decade of experience in residential and commercial work.",
    doneJobsCount: 320,
    availability: {
      mon: ["7am-7pm"],
      tue: ["7am-7pm"],
      wed: ["7am-7pm"],
      thu: ["7am-7pm"],
      fri: ["7am-7pm"],
      sat: ["8am-5pm"]
    }
  },
  {
    userId: "provider_008",
    serviceIds: [],
    experience: "1+ years",
    rating: 3.8,
    location: {
      city: "New York",
      area: "Bronx"
    },
    skills: ["Painting", "Window Cleaning"],
    bio: "New but enthusiastic painter and window cleaner, learning from every job.",
    doneJobsCount: 18,
    availability: {
      mon: ["9am-5pm"],
      tue: ["9am-5pm"],
      wed: ["9am-5pm"],
      thu: ["9am-5pm"],
      fri: ["9am-5pm"]
    }
  },
  {
    userId: "provider_009",
    serviceIds: [],
    experience: "8+ years",
    rating: 4.7,
    location: {
      city: "New York",
      area: "Staten Island"
    },
    skills: ["Carpentry", "Roofing", "Home Repair"],
    bio: "Experienced carpenter specializing in custom woodwork and roof repairs.",
    doneJobsCount: 245,
    availability: {
      mon: ["8am-6pm"],
      tue: ["8am-6pm"],
      wed: ["8am-6pm"],
      thu: ["8am-6pm"],
      fri: ["8am-6pm"]
    }
  },
  {
    userId: "provider_010",
    serviceIds: [],
    experience: "4+ years",
    rating: 4.4,
    location: {
      city: "New York",
      area: "Manhattan"
    },
    skills: ["Appliance Repair", "Electrical"],
    bio: "Certified appliance repair technician with electrical expertise.",
    doneJobsCount: 156,
    availability: {
      mon: ["9am-6pm"],
      tue: ["9am-6pm"],
      wed: ["9am-6pm"],
      thu: ["9am-6pm"],
      fri: ["9am-6pm"]
    }
  },
  {
    userId: "provider_011",
    serviceIds: [],
    experience: "6+ years",
    rating: 4.6,
    location: {
      city: "New York",
      area: "Brooklyn"
    },
    skills: ["Plumbing", "Appliance Repair"],
    bio: "Licensed plumber with extensive experience in both residential and commercial plumbing.",
    doneJobsCount: 189,
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
    userId: "provider_012",
    serviceIds: [],
    experience: "3+ years",
    rating: 4.1,
    location: {
      city: "New York",
      area: "Queens"
    },
    skills: ["Gardening", "Window Cleaning"],
    bio: "Professional gardener and window cleaner with a passion for creating beautiful outdoor spaces.",
    doneJobsCount: 67,
    availability: {
      mon: ["8am-4pm"],
      tue: ["8am-4pm"],
      wed: ["8am-4pm"],
      thu: ["8am-4pm"],
      fri: ["8am-4pm"]
    }
  },
  {
    userId: "provider_013",
    serviceIds: [],
    experience: "12+ years",
    rating: 4.8,
    location: {
      city: "New York",
      area: "Manhattan"
    },
    skills: ["Home Repair", "Carpentry", "Electrical"],
    bio: "Master handyman with over 12 years of experience in all aspects of home maintenance and repair.",
    doneJobsCount: 456,
    availability: {
      mon: ["7am-6pm"],
      tue: ["7am-6pm"],
      wed: ["7am-6pm"],
      thu: ["7am-6pm"],
      fri: ["7am-6pm"]
    }
  },
  {
    userId: "provider_014",
    serviceIds: [],
    experience: "5+ years",
    rating: 4.3,
    location: {
      city: "New York",
      area: "Bronx"
    },
    skills: ["Painting", "Cleaning"],
    bio: "Professional painter and cleaner with expertise in interior design and color coordination.",
    doneJobsCount: 134,
    availability: {
      mon: ["9am-5pm"],
      tue: ["9am-5pm"],
      wed: ["9am-5pm"],
      thu: ["9am-5pm"],
      fri: ["9am-5pm"]
    }
  },
  {
    userId: "provider_015",
    serviceIds: [],
    experience: "9+ years",
    rating: 4.7,
    location: {
      city: "New York",
      area: "Staten Island"
    },
    skills: ["Roofing", "Home Repair", "Plumbing"],
    bio: "Expert roofer and general contractor with extensive experience in residential construction.",
    doneJobsCount: 298,
    availability: {
      mon: ["8am-6pm"],
      tue: ["8am-6pm"],
      wed: ["8am-6pm"],
      thu: ["8am-6pm"],
      fri: ["8am-6pm"]
    }
  }
];

const addMoreServiceProviders = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Add provider names
    const providerNames = [
      "Rajith Fernando",
      "Dilshan Perera",
      "Nuwan Rathnayake",
      "Chamara Silva",
      "Sampath Bandara",
      "Lakmal Jayasuriya",
      "Tharindu Mendis",
      "Kusal Perera",
      "Dinesh Chandimal",
      "Angelo Mathews",
      "Sapumal Chandrasiri",
      "Udayanga Perera",
      "Lahiru Thirimanne",
      "Dimuth Karunaratne",
      "Kusal Mendis"
    ];

    // Get all services
    const services = await Service.find({}, '_id name');
    console.log(`📦 Found ${services.length} services`);
    
    if (services.length === 0) {
      console.log('❌ No services found. Please seed services first.');
      return;
    }

    // Check if providers already exist
    const existingProviders = await ServiceProvider.find({
      userId: { $in: additionalProviders.map(p => p.userId) }
    });

    if (existingProviders.length > 0) {
      console.log(`⚠️  ${existingProviders.length} providers already exist.`);
      
      // Check if they have names
      const providersWithoutNames = existingProviders.filter(p => !p.name);
      if (providersWithoutNames.length > 0) {
        console.log(`📝 ${providersWithoutNames.length} providers need names. Updating them...`);
        
        // Update existing providers with names
        for (const provider of providersWithoutNames) {
          const index = additionalProviders.findIndex(p => p.userId === provider.userId);
          if (index !== -1) {
            const providerName = providerNames[index];
            await ServiceProvider.updateOne(
              { _id: provider._id },
              { $set: { name: providerName } }
            );
            console.log(`✅ Updated ${provider.userId} with name: ${providerName}`);
          }
        }
        
        console.log('✅ All existing providers updated with names');
        return;
      } else {
        console.log('✅ All existing providers already have names');
        return;
      }
    }

    // Assign services to providers (each provider gets 2-3 services)
    const providersWithServices = additionalProviders.map((provider, index) => {
      const serviceIds = [];
      const startIndex = index % services.length;
      
      // Each provider gets 2-3 services
      for (let i = 0; i < 2 + (index % 2); i++) {
        const serviceIndex = (startIndex + i) % services.length;
        serviceIds.push((services[serviceIndex] as any)._id.toString());
      }
      
      return {
        ...provider,
        name: providerNames[index], // Add name directly to ServiceProvider
        serviceIds
      };
    });

    // Insert service providers
    console.log('🔧 Adding service providers...');
    const insertedProviders = await ServiceProvider.insertMany(providersWithServices);
    console.log(`✅ Added ${insertedProviders.length} service providers`);

    // Add provider private data

    const providerPrivateData = insertedProviders.map((provider, index) => ({
      userId: provider.userId,
      name: providerNames[index],
      nic: `NIC${Math.floor(Math.random() * 999999999) + 100000000}`,
      contactNumber: `+94${Math.floor(Math.random() * 90000000) + 10000000}`,
      emailAddress: `${providerNames[index].toLowerCase().replace(' ', '.')}@example.com`,
      personalPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      skills: provider.skills || [],
      experience: parseInt(provider.experience.replace(/\D/g, '')) || 0,
      certifications: ["Professional Certification", "Safety Training"],
      services: provider.serviceIds,
      address: {
        street: `${Math.floor(Math.random() * 9999) + 1} ${['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Maple Dr'][Math.floor(Math.random() * 5)]}`,
        city: provider.location.city,
        state: "NY",
        zipCode: `${Math.floor(Math.random() * 99999) + 10000}`
      },
      availability: {
        workingDays: "Monday to Friday",
        workingHours: "8:00 AM - 6:00 PM"
      },
      paymentMethod: "Cash, Credit Card",
      totalEarnings: Math.floor(Math.random() * 5000) + 1000,
      upcomingBookings: [],
      schedule: {},
      notifications: [],
      oldBookings: []
    }));

    console.log('🔍 Debug: Checking user IDs...');
    insertedProviders.forEach((provider, index) => {
      console.log(`Provider ${index + 1}: userId=${provider.userId}, name=${providerNames[index]}`);
    });

    console.log('👤 Adding provider private data...');
    await ProviderPrivateData.insertMany(providerPrivateData);
    console.log(`✅ Added ${providerPrivateData.length} provider private data records`);

    // Verify the data was created correctly
    console.log('🔍 Verifying data creation...');
    const verifyProviders = await ServiceProvider.find({ userId: { $in: additionalProviders.map(p => p.userId) } });
    const verifyPrivateData = await ProviderPrivateData.find({ userId: { $in: additionalProviders.map(p => p.userId) } });
    
    console.log(`📊 Verification: ${verifyProviders.length} ServiceProviders, ${verifyPrivateData.length} ProviderPrivateData`);
    
    // Check for any mismatches
    verifyProviders.forEach(provider => {
      const privateData = verifyPrivateData.find(p => p.userId === provider.userId);
      if (privateData) {
        console.log(`✅ ${provider.userId}: ${privateData.name}`);
      } else {
        console.log(`❌ ${provider.userId}: Missing private data`);
      }
    });

    // Display summary
    console.log('\n📊 Summary of added providers:');
    insertedProviders.forEach((provider, index) => {
      const privateData = providerPrivateData.find(p => p.userId === provider.userId);
      const serviceNames = provider.serviceIds
        .map(serviceId => {
          const service = services.find(s => (s as any)._id.toString() === serviceId);
          return service?.name;
        })
        .filter(Boolean);
      
      console.log(`${index + 1}. ${privateData?.name} - ${serviceNames.join(', ')} - Rating: ${provider.rating} - Exp: ${provider.experience}`);
    });

  } catch (error) {
    console.error('❌ Error adding service providers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
};

// Run the script
addMoreServiceProviders();
