import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedPovertyData() {
  console.log("🌱 Seeding poverty and agriculture data...");

  // Create system user for data creation (if not exists)
  let systemUser = await prisma.user.findUnique({
    where: { email: "alexthegoodman@gmail.com" },
  });

  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        email: "system@ourvirtue.org",
        username: "system",
        password: "not-used",
        isActive: false,
        isAdmin: true,
      },
    });
  }

  // Regional agricultural data from Africa based on FJ Dynamics blog
  const povertyDataSources = [
    {
      title: "West African Agricultural Profile - Crops and Food Security",
      description:
        "Regional analysis of primary crops, farming practices, and food security challenges in West Africa",
      sourceUrl:
        "https://www.fjdynamics.com/pt/blog/industry-insights-65/crops-in-africa-590",
      sourceOrg: "FJ Dynamics",
      dataTable: {
        columns: [
          "Crop Type",
          "Primary Crops",
          "Economic Role",
          "Key Challenge",
        ],
        data: [
          ["Staple", "Cassava", "Food security", "Seasonal food gaps"],
          ["Staple", "Yams", "Traditional nutrition", "Post-harvest losses"],
          ["Cereal", "Maize", "Basic nutrition", "Poor storage"],
          [
            "Protein",
            "Groundnuts",
            "Nutrition & income",
            "Limited market access",
          ],
          ["Cash Crop", "Cocoa", "Export earnings", "Technology access"],
        ],
      },
      geographicScope: "West Africa",
      timeRange: "2024",
      dataType: "agricultural_profile",
      isVerified: true,
      submissionNotes:
        "Qualitative agricultural data covering crop production and food security patterns",
      submitterId: systemUser.id,
    },
    {
      title: "East African Coffee and Tea Production Systems",
      description:
        "Analysis of cash crop production and smallholder farming systems in East Africa",
      sourceUrl:
        "https://www.fjdynamics.com/pt/blog/industry-insights-65/crops-in-africa-590",
      sourceOrg: "FJ Dynamics",
      dataTable: {
        columns: ["Crop", "Major Producer", "System Type", "Key Challenge"],
        data: [
          ["Coffee", "Kenya, Ethiopia", "Small-scale", "Climate variability"],
          ["Tea", "Kenya", "Small-scale", "Limited credit access"],
          ["Bananas", "Uganda", "Mixed farming", "Land availability"],
          ["Beans", "Regional", "Subsistence", "Rural poverty"],
          ["Maize", "Regional", "Mixed farming", "Population pressure"],
        ],
      },
      geographicScope: "East Africa",
      timeRange: "2024",
      dataType: "agricultural_profile",
      isVerified: true,
      submissionNotes:
        "Focus on cash crop production and rural poverty indicators",
      submitterId: systemUser.id,
    },
    {
      title: "Central African Traditional Farming and Development Potential",
      description:
        "Assessment of traditional farming systems and untapped agricultural potential in Central Africa",
      sourceUrl:
        "https://www.fjdynamics.com/pt/blog/industry-insights-65/crops-in-africa-590",
      sourceOrg: "FJ Dynamics",
      dataTable: {
        columns: ["Resource", "Status", "Opportunity", "Constraint"],
        data: [
          ["Cassava", "Primary staple", "Food security", "Traditional methods"],
          ["Plantains", "Secondary staple", "Nutrition", "Limited processing"],
          ["Rainfall", "Abundant", "Year-round farming", "Infrastructure"],
          [
            "Arable land",
            "60% uncultivated",
            "Expansion potential",
            "Market access",
          ],
          [
            "Soil quality",
            "Rich river basins",
            "High productivity",
            "Poor roads",
          ],
        ],
      },
      geographicScope: "Central Africa",
      timeRange: "2024",
      dataType: "agricultural_profile",
      isVerified: true,
      submissionNotes:
        "Emphasis on development potential and traditional farming systems",
      submitterId: systemUser.id,
    },
    {
      title: "Southern African Commercial Agriculture and Export Crops",
      description:
        "Commercial agricultural systems and fruit export industries in Southern Africa",
      sourceUrl:
        "https://www.fjdynamics.com/pt/blog/industry-insights-65/crops-in-africa-590",
      sourceOrg: "FJ Dynamics",
      dataTable: {
        columns: [
          "Crop Category",
          "Primary Crops",
          "Production Type",
          "Export Potential",
        ],
        data: [
          ["Staples", "Maize", "Commercial", "Regional trade"],
          ["Cereals", "Wheat", "Commercial", "Some export"],
          ["Cash crops", "Sugarcane", "Industrial", "High export"],
          ["Fruits", "Citrus", "Commercial", "Global export"],
          ["Fruits", "Grapes", "Commercial", "Wine export"],
        ],
      },
      geographicScope: "Southern Africa",
      timeRange: "2024",
      dataType: "agricultural_profile",
      isVerified: true,
      submissionNotes: "Commercial agricultural systems analysis",
      submitterId: systemUser.id,
    },
    {
      title: "North African Irrigation-Based Agriculture",
      description:
        "Water-dependent agricultural systems and food security in North Africa",
      sourceUrl:
        "https://www.fjdynamics.com/pt/blog/industry-insights-65/crops-in-africa-590",
      sourceOrg: "FJ Dynamics",
      dataTable: {
        columns: [
          "Crop",
          "Water Requirement",
          "Production Area",
          "Food Security Role",
        ],
        data: [
          ["Wheat", "High irrigation", "Nile Valley", "Food import substitute"],
          ["Barley", "Drought tolerant", "Semi-arid", "Livestock feed"],
          ["Olives", "Mediterranean", "Coastal", "Traditional export"],
          ["Dates", "Desert oasis", "Oases", "Specialty export"],
          ["Various", "Climate threatened", "All regions", "Import dependent"],
        ],
      },
      geographicScope: "North Africa",
      timeRange: "2024",
      dataType: "agricultural_profile",
      isVerified: true,
      submissionNotes:
        "Focus on irrigation systems and water-dependent agriculture",
      submitterId: systemUser.id,
    },
    {
      title:
        "Continental African Agricultural Overview and Development Challenges",
      description:
        "Comprehensive analysis of Africa's agricultural potential, challenges, and development opportunities",
      sourceUrl:
        "https://www.fjdynamics.com/pt/blog/industry-insights-65/crops-in-africa-590",
      sourceOrg: "FJ Dynamics",
      dataTable: {
        columns: ["Indicator", "Current Status", "Challenge", "Opportunity"],
        data: [
          [
            "Population dependency",
            "60% depend on agriculture",
            "Climate change",
            "Technology adoption",
          ],
          [
            "Land potential",
            "60% world's uncultivated land",
            "Poor infrastructure",
            "Urban markets",
          ],
          [
            "Farm size",
            "<2 hectares average",
            "Limited financing",
            "Youth engagement",
          ],
          [
            "Food security",
            "Seasonal gaps common",
            "Storage losses",
            "Investment potential",
          ],
          [
            "Market access",
            "Limited profitable reach",
            "Poor roads",
            "Regional trade",
          ],
        ],
      },
      geographicScope: "Africa",
      timeRange: "2024",
      dataType: "continental_analysis",
      isVerified: true,
      submissionNotes:
        "Comprehensive continental overview of agricultural development challenges and opportunities",
      submitterId: systemUser.id,
    },
  ];

  // Create poverty data sources
  for (const dataSource of povertyDataSources) {
    const existingSource = await prisma.povertyDataSource.findFirst({
      where: {
        title: dataSource.title,
        submitterId: systemUser.id,
      },
    });

    if (!existingSource) {
      await prisma.povertyDataSource.create({
        data: dataSource,
      });
      console.log(`✅ Created poverty data source: ${dataSource.title}`);
    } else {
      console.log(`⏭️  Data source already exists: ${dataSource.title}`);
    }
  }

  console.log("🎉 Poverty and agriculture data seeding completed!");
}

seedPovertyData()
  .catch((e) => {
    console.error("❌ Error seeding poverty data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
