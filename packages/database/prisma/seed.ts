import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.answer.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.logicRule.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.shop.deleteMany();

  // Create sample shop
  console.log('🏪 Creating sample shop...');
  const shop = await prisma.shop.create({
    data: {
      shopifyDomain: 'sample-shop.myshopify.com',
      accessToken: 'sample_access_token',
      scope: 'read_products,write_products,read_customers,write_customers',
      email: 'merchant@sample-shop.com',
      name: 'Sample Shop',
      currency: 'USD',
      timezone: 'America/New_York',
    },
  });

  // Create sample quiz
  console.log('📝 Creating sample quiz...');
  const quiz = await prisma.quiz.create({
    data: {
      shopId: shop.id,
      title: 'Product Recommendation Quiz',
      description: 'Find the perfect product for your needs',
      status: 'PUBLISHED',
      settings: {
        showProgress: true,
        allowBacktracking: true,
        timeLimit: null,
        maxAttempts: 3,
      },
      theme: {
        primaryColor: '#007cba',
        secondaryColor: '#f6f6f7',
        fontFamily: 'Inter, sans-serif',
        borderRadius: '8px',
      },
      publishedAt: new Date(),
    },
  });

  // Create sample questions
  console.log('❓ Creating sample questions...');
  const questions = await Promise.all([
    prisma.question.create({
      data: {
        quizId: quiz.id,
        order: 1,
        type: 'SINGLE_CHOICE',
        text: 'What type of product are you looking for?',
        description: 'Choose the category that best fits your needs',
        required: true,
        options: {
          choices: [
            { id: '1', text: 'Skincare', value: 'skincare' },
            { id: '2', text: 'Haircare', value: 'haircare' },
            { id: '3', text: 'Makeup', value: 'makeup' },
            { id: '4', text: 'Fragrance', value: 'fragrance' },
          ],
        },
        settings: {
          randomizeChoices: false,
          showOtherOption: false,
        },
      },
    }),
    prisma.question.create({
      data: {
        quizId: quiz.id,
        order: 2,
        type: 'SINGLE_CHOICE',
        text: 'What is your skin type?',
        description: 'This helps us recommend the right products',
        required: true,
        options: {
          choices: [
            { id: '1', text: 'Dry', value: 'dry' },
            { id: '2', text: 'Oily', value: 'oily' },
            { id: '3', text: 'Combination', value: 'combination' },
            { id: '4', text: 'Normal', value: 'normal' },
            { id: '5', text: 'Sensitive', value: 'sensitive' },
          ],
        },
        settings: {
          randomizeChoices: false,
          showOtherOption: false,
        },
      },
    }),
    prisma.question.create({
      data: {
        quizId: quiz.id,
        order: 3,
        type: 'RATING',
        text: 'How important is natural/organic ingredients to you?',
        description: 'Rate from 1 (not important) to 5 (very important)',
        required: true,
        options: {
          minRating: 1,
          maxRating: 5,
          labels: {
            1: 'Not Important',
            2: 'Somewhat Important',
            3: 'Important',
            4: 'Very Important',
            5: 'Extremely Important',
          },
        },
        settings: {
          showLabels: true,
          allowHalfRatings: false,
        },
      },
    }),
    prisma.question.create({
      data: {
        quizId: quiz.id,
        order: 4,
        type: 'TEXT',
        text: 'Any specific concerns or preferences?',
        description: 'Tell us more about what you\'re looking for',
        required: false,
        options: {
          maxLength: 500,
          placeholder: 'e.g., I prefer cruelty-free products, I have sensitive skin...',
        },
        settings: {
          multiline: true,
          showCharacterCount: true,
        },
      },
    }),
  ]);

  // Create sample logic rules
  console.log('🔀 Creating sample logic rules...');
  await prisma.logicRule.create({
    data: {
      quizId: quiz.id,
      type: 'SHOW_QUESTION',
      conditions: {
        questionId: questions[0].id,
        operator: 'equals',
        value: 'skincare',
      },
      actions: {
        action: 'show_question',
        targetQuestionId: questions[1].id,
      },
      priority: 1,
      isActive: true,
    },
  });

  // Create sample submission
  console.log('📊 Creating sample submission...');
  const submission = await prisma.submission.create({
    data: {
      quizId: quiz.id,
      sessionId: 'sample_session_123',
      status: 'COMPLETED',
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        ipAddress: '192.168.1.1',
        referrer: 'https://sample-shop.myshopify.com',
      },
      completedAt: new Date(),
    },
  });

  // Create sample answers
  console.log('✏️ Creating sample answers...');
  await Promise.all([
    prisma.answer.create({
      data: {
        submissionId: submission.id,
        questionId: questions[0].id,
        value: 'skincare',
        metadata: {
          answeredAt: new Date(),
          timeSpent: 15,
        },
      },
    }),
    prisma.answer.create({
      data: {
        submissionId: submission.id,
        questionId: questions[1].id,
        value: 'combination',
        metadata: {
          answeredAt: new Date(),
          timeSpent: 12,
        },
      },
    }),
    prisma.answer.create({
      data: {
        submissionId: submission.id,
        questionId: questions[2].id,
        value: 4,
        metadata: {
          answeredAt: new Date(),
          timeSpent: 8,
        },
      },
    }),
  ]);

  // Create sample analytics events
  console.log('📈 Creating sample analytics events...');
  await Promise.all([
    prisma.analyticsEvent.create({
      data: {
        quizId: quiz.id,
        submissionId: submission.id,
        eventType: 'quiz_started',
        eventData: {
          timestamp: new Date(),
          source: 'storefront',
        },
        metadata: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          ipAddress: '192.168.1.1',
        },
      },
    }),
    prisma.analyticsEvent.create({
      data: {
        quizId: quiz.id,
        submissionId: submission.id,
        eventType: 'quiz_completed',
        eventData: {
          timestamp: new Date(),
          totalQuestions: 4,
          answeredQuestions: 3,
          timeSpent: 35,
        },
        metadata: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          ipAddress: '192.168.1.1',
        },
      },
    }),
  ]);

  console.log('✅ Database seeding completed successfully!');
  console.log(`📊 Created: ${shop.id} shop, ${quiz.id} quiz, ${questions.length} questions, ${submission.id} submission`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
