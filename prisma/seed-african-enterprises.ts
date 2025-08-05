import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedAfricanEnterprises() {
  console.log("🌱 Seeding African regional enterprise data...");

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

  // African regional enterprise and money-making endeavor data
  const africanEnterprisesSources = [
    {
      title: "West African SME Financing and Business Development",
      description:
        "IFC analysis of small and medium enterprise financing and business opportunities in West Africa",
      sourceUrl: "https://www.ifc.org/en/pressroom/2023/ifc-and-bank-of-africa-group-deepen-partnership-to-boost-sme-financing-in-africa",
      sourceOrg: "International Finance Corporation (IFC)",
      dataTable: {
        columns: [
          "Country",
          "SME Finance Gap",
          "Key Sectors",
          "IFC Investment Focus",
        ],
        data: [
          ["Benin", "$2.1B estimated", "Agriculture, Trade", "BOA lending facility"],
          ["Burkina Faso", "$1.8B estimated", "Agriculture, Mining", "Risk-sharing facility"],
          ["Côte d'Ivoire", "$5.2B estimated", "Agriculture, Manufacturing", "SME lending scale-up"],
          ["Ghana", "$3.7B estimated", "Agriculture, Services", "Working capital access"],
          ["Mali", "$1.5B estimated", "Agriculture, Trade", "Credit constraint relief"],
          ["Senegal", "$2.8B estimated", "Agriculture, Fisheries", "BOA partnership"],
        ],
      },
      geographicScope: "West Africa",
      timeRange: "2023-2024",
      dataType: "sme_finance_analysis",
      isVerified: true,
      submissionNotes:
        "Based on IFC partnership with Bank of Africa Group for SME financing in West Africa",
      submitterId: systemUser.id,
    },
    {
      title: "East African SME Banking and Economic Growth Analysis",
      description:
        "African Development Bank study on SME financing and economic growth projections for East Africa",
      sourceUrl: "https://www.afdb.org/en/news-and-events/east-african-small-and-medium-sized-enterprises-a-strategic-priority-for-banks-finds-new-afdb-study-8991",
      sourceOrg: "African Development Bank (AfDB)",
      dataTable: {
        columns: ["Country", "SME Bank Exposure", "Growth Projection", "Key Sectors"],
        data: [
          ["Kenya", "50% of bank lending", "5.1% (2023)", "Agriculture, Services, Tech"],
          ["Uganda", "42% of bank lending", "5.8% (2024)", "Agriculture, Manufacturing"],
          ["Tanzania", "37% of bank lending", "5.2% (2023)", "Agriculture, Mining, Tourism"],
          ["Rwanda", "35% estimated", "6.2% (2024)", "Agriculture, Services, ICT"],
          ["Ethiopia", "28% estimated", "4.8% (2023)", "Agriculture, Manufacturing"],
          ["Zambia", "18% of bank lending", "4.5% (2024)", "Mining, Agriculture"],
        ],
      },
      geographicScope: "East Africa",
      timeRange: "2023-2024",
      dataType: "sme_banking_analysis",
      isVerified: true,
      submissionNotes:
        "AfDB data showing East Africa leads continental growth at 5+ percent, with varying SME bank exposure",
      submitterId: systemUser.id,
    },
    {
      title: "Sub-Saharan Africa Informal Economy Enterprises",
      description:
        "IMF analysis of informal economy size, determinants, and enterprise types across Sub-Saharan Africa",
      sourceUrl: "https://www.imf.org/en/Publications/WP/Issues/2017/07/10/The-Informal-Economy-in-Sub-Saharan-Africa-Size-and-Determinants-45017",
      sourceOrg: "International Monetary Fund (IMF)",
      dataTable: {
        columns: [
          "Country/Region",
          "Informal Economy %",
          "Common Activities",
          "Employment Share",
        ],
        data: [
          ["Benin", "50-65%", "Street vendors, food processing", "83% of total employment"],
          ["Tanzania", "50-65%", "Agriculture, small trade", "85% in rural areas"],
          ["Nigeria", "50-65%", "Trading, artisanal production", "Large urban informal sector"],
          ["South Africa", "20-25%", "Services, manufacturing", "Lower informality rate"],
          ["Mauritius", "20-25%", "Tourism, services", "Most formalized economy"],
          ["Regional Average", "83%", "Agriculture, trade, services", "Absorbs youth employment"],
        ],
      },
      geographicScope: "Sub-Saharan Africa",
      timeRange: "2017-2024",
      dataType: "informal_economy_analysis",
      isVerified: true,
      submissionNotes:
        "IMF research showing informal economy accounts for 83% of employment in Africa",
      submitterId: systemUser.id,
    },
    {
      title: "African Development Bank Southern Africa Business Strategy",
      description:
        "AfDB regional strategy focused on middle-income countries and private sector development in Southern Africa",
      sourceUrl: "https://www.afdb.org/en/annual-report-and-financial-report-2023/regional-portfolio-and-approvals",
      sourceOrg: "African Development Bank (AfDB)",
      dataTable: {
        columns: [
          "Country",
          "AfDB Focus Area",
          "Growth Rate 2023",
          "Key Sectors",
        ],
        data: [
          ["South Africa", "Budget support lending", "47% approval increase", "Manufacturing, Mining, Services"],
          ["Angola", "Middle-income engagement", "Economic diversification", "Oil, Agriculture, Infrastructure"],
          ["Mauritius", "Budget support focus", "Service economy", "Financial services, Tourism"],
          ["Botswana", "Private sector development", "Diamond economy", "Mining, Livestock, Tourism"],
          ["Namibia", "ADF transition support", "Resource extraction", "Mining, Fisheries, Agriculture"],
          ["Zambia", "NSO business development", "Copper-dependent", "Mining, Agriculture, Tourism"],
        ],
      },
      geographicScope: "Southern Africa",
      timeRange: "2023-2024",
      dataType: "development_strategy",
      isVerified: true,
      submissionNotes:
        "AfDB strategy emphasizing middle-income country engagement and private sector job creation",
      submitterId: systemUser.id,
    },
    {
      title: "African Development Bank North Africa Regional Performance",
      description:
        "AfDB analysis of North African regional economic performance and sectoral development",
      sourceUrl: "https://www.afdb.org/en/annual-report-and-financial-report-2023/regional-portfolio-and-approvals",
      sourceOrg: "African Development Bank (AfDB)",
      dataTable: {
        columns: [
          "Indicator",
          "Performance 2023",
          "Key Sectors",
          "Development Focus",
        ],
        data: [
          ["Regional Growth", "72% approval increase", "Infrastructure, Energy", "Diversification from oil"],
          ["Infrastructure", "60% of portfolio", "Power, Transport, Water", "Regional connectivity"],
          ["Agriculture", "Food security focus", "Wheat, Olives, Dates", "Water-efficient farming"],
          ["Energy", "Renewable transition", "Solar, Wind", "Green energy exports"],
          ["Tourism", "Post-COVID recovery", "Heritage, Coastal", "Service sector jobs"],
          ["Manufacturing", "Textile exports", "Garments, Processing", "Value-added production"],
        ],
      },
      geographicScope: "North Africa",
      timeRange: "2023-2024",
      dataType: "regional_performance",
      isVerified: true,
      submissionNotes:
        "AfDB data showing 72% increase in North Africa approvals with infrastructure focus",
      submitterId: systemUser.id,
    },
    {
      title: "IFC Digital Economy and MSME Financing Opportunities in Africa",
      description:
        "IFC analysis of digital transformation potential and technology infrastructure investments across Africa",
      sourceUrl: "https://www.ifc.org/en/pressroom/2024/ifc-report-shows-digitalization-holds-immense-promise-economic-potential-for-african-businesses-of-all-sizes",
      sourceOrg: "International Finance Corporation (IFC)",
      dataTable: {
        columns: [
          "Investment Opportunity",
          "Market Size",
          "Technology Cost Premium",
          "Job Creation Potential",
        ],
        data: [
          ["Infrastructure Investment", "$6B annually", "35% higher than other regions", "16 jobs per $1M invested"],
          ["Digital Transformation", "$2.7B for businesses", "Software/equipment premium", "Start-up ecosystem growth"],
          ["MSME Financing", "$25B in Nigeria alone", "Supply chain finance", "70% of MSMEs lack financing"],
          ["Technology Gap Closure", "Continental scale", "Infrastructure barrier", "Significant multiplier effect"],
          ["Mobile Money Services", "Widespread adoption", "Low infrastructure need", "Financial inclusion driver"],
          ["Digital Start-ups", "Growing ecosystem", "High-speed internet need", "Youth employment focus"],
        ],
      },
      geographicScope: "Africa",
      timeRange: "2024",
      dataType: "digital_investment_analysis",
      isVerified: true,
      submissionNotes:
        "IFC research highlighting $6B annual infrastructure investment opportunity and digital transformation potential",
      submitterId: systemUser.id,
    },
  ];

  // Create African enterprise data sources
  for (const dataSource of africanEnterprisesSources) {
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
      console.log(`✅ Created enterprise data source: ${dataSource.title}`);
    } else {
      console.log(`⏭️  Data source already exists: ${dataSource.title}`);
    }
  }

  console.log("🎉 African enterprise data seeding completed!");
}

seedAfricanEnterprises()
  .catch((e) => {
    console.error("❌ Error seeding African enterprise data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });