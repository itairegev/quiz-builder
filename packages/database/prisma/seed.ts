import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create a sample shop
  const shop = await prisma.shop.upsert({
    where: { shopifyDomain: 'quizplayground.myshopify.com' },
    update: {},
    create: {
      shopifyDomain: 'quizplayground.myshopify.com',
      accessToken: 'sample_access_token_for_development',
      scope: 'read_products,write_products,read_customers,write_customers,read_orders',
      email: 'dev@quizplayground.com',
      name: 'Quiz Playground Store',
      currency: 'USD',
      timezone: 'UTC',
    },
  });

  console.log('✅ Shop created:', shop.shopifyDomain);

  // Create a sample quiz
  const quiz = await prisma.quiz.upsert({
    where: { id: 'sample_quiz_1' },
    update: {},
    create: {
      id: 'sample_quiz_1',
      shopId: shop.id,
      title: 'Skin Care Quiz',
      description: 'Find your perfect skin care routine with our personalized quiz',
      status: 'PUBLISHED',
      settings: {
        theme: 'modern',
        showProgress: true,
        allowSkipping: false,
        timeLimit: null,
        maxAttempts: 1,
      },
      theme: {
        primaryColor: '#6366f1',
        secondaryColor: '#f3f4f6',
        fontFamily: 'Inter',
        borderRadius: '8px',
      },
      publishedAt: new Date(),
    },
  });

  console.log('✅ Quiz created:', quiz.title);

  // Create sample questions
  const questions = await Promise.all([
    prisma.question.upsert({
      where: { id: 'question_1' },
      update: {},
      create: {
        id: 'question_1',
        quizId: quiz.id,
        order: 1,
        type: 'SINGLE_CHOICE',
        text: 'What is your skin type?',
        description: 'Choose the option that best describes your skin',
        required: true,
        options: [
          { id: '1', text: 'Oily', value: 'oily' },
          { id: '2', text: 'Dry', value: 'dry' },
          { id: '3', text: 'Combination', value: 'combination' },
          { id: '4', text: 'Normal', value: 'normal' },
          { id: '5', text: 'Sensitive', value: 'sensitive' },
        ],
        settings: {
          randomizeOptions: false,
          showImage: false,
        },
      },
    }),
    prisma.question.upsert({
      where: { id: 'question_2' },
      update: {},
      create: {
        id: 'question_2',
        quizId: quiz.id,
        order: 2,
        type: 'SINGLE_CHOICE',
        text: 'What are your main skin concerns?',
        description: 'Select all that apply',
        required: true,
        options: [
          { id: '1', text: 'Acne', value: 'acne' },
          { id: '2', text: 'Aging', value: 'aging' },
          { id: '3', text: 'Dark spots', value: 'dark_spots' },
          { id: '4', text: 'Dryness', value: 'dryness' },
          { id: '5', text: 'Redness', value: 'redness' },
          { id: '6', text: 'Uneven texture', value: 'uneven_texture' },
        ],
        settings: {
          randomizeOptions: false,
          showImage: false,
        },
      },
    }),
    prisma.question.upsert({
      where: { id: 'question_3' },
      update: {},
      create: {
        id: 'question_3',
        quizId: quiz.id,
        order: 3,
        type: 'RATING',
        text: 'How would you rate your current skin care routine?',
        description: '1 = No routine, 5 = Advanced routine',
        required: true,
        options: {
          min: 1,
          max: 5,
          step: 1,
          labels: {
            1: 'No routine',
            2: 'Basic',
            3: 'Good',
            4: 'Advanced',
            5: 'Expert',
          },
        },
        settings: {
          showLabels: true,
          allowHalfSteps: false,
        },
      },
    }),
  ]);

  console.log('✅ Questions created:', questions.length);

  // Create sample logic rules
  const logicRules = await Promise.all([
    prisma.logicRule.upsert({
      where: { id: 'rule_1' },
      update: {},
      create: {
        id: 'rule_1',
        quizId: quiz.id,
        questionId: questions[1].id,
        type: 'SHOW_QUESTION',
        conditions: {
          operator: 'AND',
          rules: [
            {
              field: 'question_1',
              operator: 'equals',
              value: 'sensitive',
            },
          ],
        },
        actions: [
          {
            type: 'show_question',
            target: 'question_2',
          },
        ],
        priority: 1,
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Logic rules created:', logicRules.length);

  // Create a sample submission
  const submission = await prisma.submission.upsert({
    where: { id: 'sample_submission_1' },
    update: {},
    create: {
      id: 'sample_submission_1',
      quizId: quiz.id,
      sessionId: 'sample_session_123',
      status: 'COMPLETED',
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        ipAddress: '127.0.0.1',
        referrer: 'https://quizplayground.myshopify.com',
        deviceType: 'desktop',
      },
      startedAt: new Date(Date.now() - 300000), // 5 minutes ago
      completedAt: new Date(),
    },
  });

  console.log('✅ Submission created:', submission.id);

  // Create sample answers
  const answers = await Promise.all([
    prisma.answer.upsert({
      where: { id: 'answer_1' },
      update: {},
      create: {
        id: 'answer_1',
        submissionId: submission.id,
        questionId: questions[0].id,
        value: 'combination',
        metadata: {
          timeSpent: 15000, // 15 seconds
          confidence: 0.9,
        },
      },
    }),
    prisma.answer.upsert({
      where: { id: 'answer_2' },
      update: {},
      create: {
        id: 'answer_2',
        submissionId: submission.id,
        questionId: questions[1].id,
        value: ['acne', 'aging'],
        metadata: {
          timeSpent: 25000, // 25 seconds
          confidence: 0.8,
        },
      },
    }),
    prisma.answer.upsert({
      where: { id: 'answer_3' },
      update: {},
      create: {
        id: 'answer_3',
        submissionId: submission.id,
        questionId: questions[2].id,
        value: 3,
        metadata: {
          timeSpent: 10000, // 10 seconds
          confidence: 0.7,
        },
      },
    }),
  ]);

  console.log('✅ Answers created:', answers.length);

  // Create sample analytics events
  const analyticsEvents = await Promise.all([
    prisma.analyticsEvent.upsert({
      where: { id: 'event_1' },
      update: {},
      create: {
        id: 'event_1',
        quizId: quiz.id,
        submissionId: submission.id,
        eventType: 'quiz_started',
        eventData: {
          timestamp: submission.startedAt,
          source: 'homepage',
        },
        metadata: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          ipAddress: '127.0.0.1',
        },
      },
    }),
    prisma.analyticsEvent.upsert({
      where: { id: 'event_2' },
      update: {},
      create: {
        id: 'event_2',
        quizId: quiz.id,
        submissionId: submission.id,
        eventType: 'question_answered',
        eventData: {
          questionId: questions[0].id,
          answer: 'combination',
          timeSpent: 15000,
        },
        metadata: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          ipAddress: '127.0.0.1',
        },
      },
    }),
    prisma.analyticsEvent.upsert({
      where: { id: 'event_3' },
      update: {},
      create: {
        id: 'event_3',
        quizId: quiz.id,
        submissionId: submission.id,
        eventType: 'quiz_completed',
        eventData: {
          timestamp: submission.completedAt,
          totalTime: 300000, // 5 minutes
          questionsAnswered: 3,
        },
        metadata: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          ipAddress: '127.0.0.1',
        },
      },
    }),
  ]);

  console.log('✅ Analytics events created:', analyticsEvents.length);

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📊 Sample data created:');
  console.log(`   - Shop: ${shop.shopifyDomain}`);
  console.log(`   - Quiz: ${quiz.title}`);
  console.log(`   - Questions: ${questions.length}`);
  console.log(`   - Logic Rules: ${logicRules.length}`);
  console.log(`   - Submission: ${submission.id}`);
  console.log(`   - Answers: ${answers.length}`);
  console.log(`   - Analytics Events: ${analyticsEvents.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
