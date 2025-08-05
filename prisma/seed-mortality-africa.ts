import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedAfricanMortalityData() {
  console.log("🌱 Seeding African mortality and causes of death data...");

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

  // African mortality data sources by region
  const mortalityDataSources = [
    {
      title: "North Africa Mortality Patterns and Health Indicators",
      description:
        "Comprehensive analysis of causes of death and health indicators across North African countries including Egypt, Libya, Tunisia, Algeria, and Morocco",
      sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6493284/",
      sourceOrg: "PMC - National Center for Biotechnology Information",
      dataTable: {
        columns: [
          "Country",
          "Crude Death Rate (per 1,000)",
          "Primary Health Achievement",
          "Key Challenge",
        ],
        data: [
          ["Algeria", "5", "SDG-3 progress", "Road traffic injuries"],
          ["Egypt", "5", "Maternal health targets met", "NCDs rising"],
          ["Libya", "7", "U5 mortality targets met", "Healthcare disruption"],
          ["Morocco", "6", "Malaria eliminated", "Road safety"],
          ["Tunisia", "6", "Comprehensive health progress", "Aging population"],
        ],
      },
      geographicScope: "North Africa",
      timeRange: "2023",
      dataType: "mortality_statistics",
      isVerified: true,
      submissionNotes:
        "WHO and World Bank data on mortality rates and health achievements in North African countries",
      submitterId: systemUser.id,
    },
    {
      title: "West Africa Leading Causes of Death by Age Group",
      description:
        "Age-stratified analysis of primary causes of death across West African countries including Nigeria, Ghana, Mali, Senegal, and Burkina Faso",
      sourceUrl: "https://www.ncbi.nlm.nih.gov/books/NBK236385/",
      sourceOrg: "NCBI Bookshelf - Effects of Health Programs",
      dataTable: {
        columns: ["Age Group", "Primary Cause", "Secondary Cause", "Trend"],
        data: [
          ["Neonatal", "Low birthweight", "Birth trauma", "Improving"],
          ["Post-neonatal", "Diarrheal diseases", "Pneumonia", "Declining"],
          ["Ages 1-4", "Measles", "Diarrheal diseases", "Vaccine impact"],
          ["School-age", "Malaria", "Malnutrition", "Persistent challenge"],
          ["Adults", "Lower respiratory infections", "NCDs rising", "Transitioning"],
        ],
      },
      geographicScope: "West Africa",
      timeRange: "2021",
      dataType: "age_stratified_mortality",
      isVerified: true,
      submissionNotes:
        "Comprehensive analysis of mortality patterns by age group showing epidemiological transition",
      submitterId: systemUser.id,
    },
    {
      title: "East Africa Disease Burden and Mortality Statistics",
      description:
        "Regional mortality analysis covering Kenya, Ethiopia, Tanzania, Uganda, Rwanda, and Somalia with WHO data",
      sourceUrl: "https://files.aho.afro.who.int/afahobckpcontainer/production/files/iAHO_Mortality_Regional-Factsheet.pdf",
      sourceOrg: "WHO Africa Regional Office",
      dataTable: {
        columns: ["Country/Indicator", "Value", "Category", "Status"],
        data: [
          ["Regional adult mortality", "308 per 1,000", "Overall", "High burden"],
          ["Ethiopia adult mortality", "218 per 1,000", "Country-specific", "Above average"],
          ["Rwanda U5 mortality", "52 per 1,000 births", "Child health", "Significant progress"],
          ["Kenya vital registration", "50% coverage", "Data systems", "Moderate"],
          ["Leading cause overall", "Lower respiratory infections", "Disease pattern", "Infectious diseases"],
        ],
      },
      geographicScope: "East Africa",
      timeRange: "2015-2021",
      dataType: "regional_mortality_analysis",
      isVerified: true,
      submissionNotes:
        "WHO regional data highlighting both progress and persistent challenges in East African mortality",
      submitterId: systemUser.id,
    },
    {
      title: "Central Africa Extreme Mortality Crisis and Data Challenges",
      description:
        "Critical analysis of mortality crisis in Central African countries with focus on CAR, DRC, and data quality issues",
      sourceUrl: "https://conflictandhealth.biomedcentral.com/articles/10.1186/s13031-023-00514-z",
      sourceOrg: "Conflict and Health Journal",
      dataTable: {
        columns: ["Country", "Data Quality", "Key Finding", "Crisis Level"],
        data: [
          ["Central African Republic", "Unusable", "5.6% population dies yearly", "Extreme crisis"],
          ["Democratic Republic of Congo", "Unavailable", "Quality issues severe", "Data emergency"],
          ["Chad", "Limited", "Humanitarian indicators poor", "High concern"],
          ["Cameroon", "Moderate", "Regional variation high", "Monitoring needed"],
          ["Regional average", "Poor", "Vital registration <50%", "System failure"],
        ],
      },
      geographicScope: "Central Africa",
      timeRange: "2023",
      dataType: "crisis_mortality_analysis",
      isVerified: true,
      submissionNotes:
        "Documentation of severe mortality crisis and data system failures requiring urgent international attention",
      submitterId: systemUser.id,
    },
    {
      title: "Southern Africa Health Transitions and Mortality Patterns",
      description:
        "Analysis of mortality trends in Southern African countries including South Africa, Botswana, Zimbabwe, Namibia, and Lesotho",
      sourceUrl: "https://www.statssa.gov.za/publications/P03093/P030932020.pdf",
      sourceOrg: "Statistics South Africa",
      dataTable: {
        columns: ["Indicator", "Value", "Country Focus", "Trend"],
        data: [
          ["Leading natural deaths", "Tuberculosis, Diabetes, Stroke", "South Africa", "NCD transition"],
          ["U5 mortality rate", "28 per 1,000 births", "South Africa", "Moderate progress"],
          ["Maternal mortality", "109 per 100,000 births", "Regional", "Improvement needed"],
          ["Vital registration coverage", "90%", "South Africa", "Good data quality"],
          ["WHO mortality classification", "AFR E - High adult mortality", "Regional", "Health system strain"],
        ],
      },
      geographicScope: "Southern Africa",
      timeRange: "2019-2020",
      dataType: "health_transition_analysis",
      isVerified: true,
      submissionNotes:
        "Documentation of epidemiological transition with mixed communicable and non-communicable disease burden",
      submitterId: systemUser.id,
    },
    {
      title: "Continental African Mortality Overview and Health Challenges",
      description:
        "Pan-African analysis of mortality patterns, data quality, and health system challenges across all regions",
      sourceUrl: "https://www.statista.com/statistics/1029337/top-causes-of-death-africa/",
      sourceOrg: "Statista Health Statistics",
      dataTable: {
        columns: ["Challenge Area", "Status", "Regional Variation", "Priority Level"],
        data: [
          ["Data quality", "Poor in most countries", "North Africa better", "Critical"],
          ["Leading cause", "Lower respiratory infections", "Consistent across regions", "High intervention"],
          ["Child mortality", "100-200+ per 1,000 births", "Wide regional gaps", "Urgent action"],
          ["Disease transition", "Mixed communicable/NCD burden", "Southern/North more advanced", "Strategic planning"],
          ["Health systems", "Weak vital registration", "Urban areas better coverage", "Infrastructure priority"],
        ],
      },
      geographicScope: "Continental Africa",
      timeRange: "2021-2023",
      dataType: "continental_health_overview",
      isVerified: true,
      submissionNotes:
        "Comprehensive overview highlighting both progress and persistent challenges requiring coordinated international response",
      submitterId: systemUser.id,
    },
    {
      title: "African Malaria and Infectious Disease Mortality Impact",
      description:
        "Specific analysis of malaria and infectious disease mortality across African regions with elimination success stories",
      sourceUrl: "https://www.who.int/data/gho/data/themes/mortality-and-global-health-estimates/ghe-leading-causes-of-death",
      sourceOrg: "World Health Organization",
      dataTable: {
        columns: ["Disease/Region", "Impact Level", "Success Story", "Remaining Challenge"],
        data: [
          ["Malaria - North Africa", "Eliminated", "Algeria, Morocco, Tunisia", "Maintain elimination"],
          ["Malaria - West Africa", "High burden", "Nigeria accounts for major deaths", "Prevention scale-up"],
          ["Malaria - East Africa", "Variable progress", "Rwanda improving rapidly", "Uganda still high burden"],
          ["TB - Southern Africa", "Leading killer", "South Africa priority", "Drug resistance"],
          ["HIV/AIDS - Regional", "Major adult cause", "Treatment access improved", "Prevention gaps"],
        ],
      },
      geographicScope: "Continental Africa",
      timeRange: "2021",
      dataType: "infectious_disease_analysis",
      isVerified: true,
      submissionNotes:
        "Focus on infectious diseases showing both elimination successes and persistent burden requiring targeted interventions",
      submitterId: systemUser.id,
    },
  ];

  // Create mortality data sources
  for (const dataSource of mortalityDataSources) {
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
      console.log(`✅ Created mortality data source: ${dataSource.title}`);
    } else {
      console.log(`⏭️  Data source already exists: ${dataSource.title}`);
    }
  }

  console.log("🎉 African mortality data seeding completed!");
}

seedAfricanMortalityData()
  .catch((e) => {
    console.error("❌ Error seeding mortality data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });