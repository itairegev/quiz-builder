import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { QuestionType, LogicRuleType } from '@prisma/client';
import { QuizBuilderData, QuizTemplate, QuestionBuilderData, LogicRuleBuilderData } from './quiz-builder.service';

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

@Injectable()
export class QuizTemplateService {
  private readonly logger = new Logger(QuizTemplateService.name);

  // Predefined template categories
  private readonly categories: TemplateCategory[] = [
    {
      id: 'product-recommendation',
      name: 'Product Recommendation',
      description: 'Help customers find the perfect product',
      icon: 'shopping-bag',
      color: '#3B82F6',
    },
    {
      id: 'lead-generation',
      name: 'Lead Generation',
      description: 'Capture leads and customer information',
      icon: 'user-plus',
      color: '#10B981',
    },
    {
      id: 'customer-feedback',
      name: 'Customer Feedback',
      description: 'Gather feedback and testimonials',
      icon: 'message-circle',
      color: '#F59E0B',
    },
    {
      id: 'personality-quiz',
      name: 'Personality Quiz',
      description: 'Engage customers with fun personality tests',
      icon: 'heart',
      color: '#EF4444',
    },
    {
      id: 'knowledge-test',
      name: 'Knowledge Test',
      description: 'Test customer knowledge and educate',
      icon: 'book-open',
      color: '#8B5CF6',
    },
    {
      id: 'survey',
      name: 'Survey',
      description: 'Conduct market research and surveys',
      icon: 'clipboard-list',
      color: '#06B6D4',
    },
  ];

  // Predefined quiz templates
  private readonly templates: QuizTemplate[] = [
    {
      id: 'skincare-routine-finder',
      name: 'Skincare Routine Finder',
      description: 'Help customers find their perfect skincare routine',
      category: 'product-recommendation',
      tags: ['skincare', 'beauty', 'personalization'],
      template: {
        title: 'Find Your Perfect Skincare Routine',
        description: 'Answer a few questions to get personalized product recommendations',
        settings: {
          showProgress: true,
          allowBacktracking: true,
          showQuestionNumbers: false,
          requireAllQuestions: true,
          showResults: true,
          collectEmail: true,
          thankYouMessage: 'Thank you! Check your email for your personalized recommendations.',
        },
        theme: {
          primaryColor: '#F472B6',
          secondaryColor: '#FDF2F8',
          backgroundColor: '#FFFFFF',
          textColor: '#374151',
          fontFamily: 'Inter',
          fontSize: '16px',
          borderRadius: '12px',
          buttonStyle: 'rounded',
          layout: 'single-column',
          animation: 'fade',
        },
        questions: [
          {
            order: 1,
            type: QuestionType.SINGLE_CHOICE,
            text: 'What is your primary skin concern?',
            description: 'Select the concern that bothers you most',
            required: true,
            options: [
              { text: 'Acne and breakouts', value: 'acne', score: 1 },
              { text: 'Dry skin', value: 'dryness', score: 2 },
              { text: 'Aging and fine lines', value: 'aging', score: 3 },
              { text: 'Dark spots and hyperpigmentation', value: 'pigmentation', score: 4 },
              { text: 'Sensitive skin', value: 'sensitive', score: 5 },
            ],
          },
          {
            order: 2,
            type: QuestionType.SINGLE_CHOICE,
            text: 'What is your skin type?',
            description: 'Choose the option that best describes your skin',
            required: true,
            options: [
              { text: 'Oily', value: 'oily', score: 1 },
              { text: 'Dry', value: 'dry', score: 2 },
              { text: 'Combination', value: 'combination', score: 3 },
              { text: 'Normal', value: 'normal', score: 4 },
              { text: 'Sensitive', value: 'sensitive', score: 5 },
            ],
          },
          {
            order: 3,
            type: QuestionType.RATING,
            text: 'How much time do you want to spend on your skincare routine?',
            description: 'Rate from 1 (minimal) to 5 (extensive)',
            required: true,
            settings: {
              minValue: 1,
              maxValue: 5,
              step: 1,
            },
          },
          {
            order: 4,
            type: QuestionType.TEXT,
            text: 'What is your email address?',
            description: 'We\'ll send your personalized recommendations here',
            required: true,
            settings: {
              placeholder: 'Enter your email address',
            },
            validation: {
              required: true,
              pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
              message: 'Please enter a valid email address',
            },
          },
        ],
        logicRules: [
          {
            type: LogicRuleType.ADD_TO_CART,
            priority: 1,
            isActive: true,
            conditions: [
              {
                questionId: 'q1',
                operator: 'equals',
                value: 'acne',
              },
            ],
            actions: [
              {
                type: 'add_to_cart',
                value: 'acne-fighting-serum',
              },
            ],
          },
        ],
      },
    },
    {
      id: 'style-quiz',
      name: 'Style Personality Quiz',
      description: 'Help customers discover their fashion style',
      category: 'personality-quiz',
      tags: ['fashion', 'style', 'personality'],
      template: {
        title: 'Discover Your Style Personality',
        description: 'Find out which fashion style matches your personality',
        settings: {
          showProgress: true,
          allowBacktracking: true,
          showQuestionNumbers: true,
          requireAllQuestions: true,
          showResults: true,
          collectEmail: false,
          thankYouMessage: 'Your style personality has been revealed!',
        },
        theme: {
          primaryColor: '#1F2937',
          secondaryColor: '#F3F4F6',
          backgroundColor: '#FFFFFF',
          textColor: '#374151',
          fontFamily: 'Playfair Display',
          fontSize: '18px',
          borderRadius: '8px',
          buttonStyle: 'square',
          layout: 'card',
          animation: 'slide',
        },
        questions: [
          {
            order: 1,
            type: QuestionType.IMAGE_CHOICE,
            text: 'Which outfit appeals to you most?',
            description: 'Choose the style that speaks to you',
            required: true,
            options: [
              { text: 'Classic blazer and trousers', value: 'classic', image: '/images/classic-style.jpg' },
              { text: 'Bohemian dress with accessories', value: 'boho', image: '/images/boho-style.jpg' },
              { text: 'Minimalist white tee and jeans', value: 'minimal', image: '/images/minimal-style.jpg' },
              { text: 'Edgy leather jacket and boots', value: 'edgy', image: '/images/edgy-style.jpg' },
            ],
          },
          {
            order: 2,
            type: QuestionType.MULTIPLE_CHOICE,
            text: 'What occasions do you dress for most often?',
            description: 'Select all that apply',
            required: true,
            options: [
              { text: 'Work/Professional', value: 'work' },
              { text: 'Casual everyday', value: 'casual' },
              { text: 'Social events', value: 'social' },
              { text: 'Date nights', value: 'date' },
              { text: 'Travel', value: 'travel' },
            ],
            settings: {
              allowMultiple: true,
            },
          },
        ],
        logicRules: [],
      },
    },
    {
      id: 'customer-satisfaction',
      name: 'Customer Satisfaction Survey',
      description: 'Measure customer satisfaction and gather feedback',
      category: 'customer-feedback',
      tags: ['feedback', 'satisfaction', 'survey'],
      template: {
        title: 'How Was Your Experience?',
        description: 'Help us improve by sharing your feedback',
        settings: {
          showProgress: true,
          allowBacktracking: true,
          showQuestionNumbers: false,
          requireAllQuestions: false,
          showResults: false,
          collectEmail: true,
          thankYouMessage: 'Thank you for your valuable feedback!',
        },
        theme: {
          primaryColor: '#059669',
          secondaryColor: '#D1FAE5',
          backgroundColor: '#FFFFFF',
          textColor: '#374151',
          fontFamily: 'Inter',
          fontSize: '16px',
          borderRadius: '8px',
          buttonStyle: 'rounded',
          layout: 'single-column',
          animation: 'none',
        },
        questions: [
          {
            order: 1,
            type: QuestionType.RATING,
            text: 'How satisfied are you with your purchase?',
            description: 'Rate your overall satisfaction',
            required: true,
            settings: {
              minValue: 1,
              maxValue: 5,
              step: 1,
            },
          },
          {
            order: 2,
            type: QuestionType.RATING,
            text: 'How likely are you to recommend us to a friend?',
            description: 'Rate from 1 (not likely) to 10 (very likely)',
            required: true,
            settings: {
              minValue: 1,
              maxValue: 10,
              step: 1,
            },
          },
          {
            order: 3,
            type: QuestionType.TEXT,
            text: 'What could we improve?',
            description: 'Your suggestions help us serve you better',
            required: false,
            settings: {
              placeholder: 'Share your thoughts...',
              maxLength: 500,
            },
          },
        ],
        logicRules: [],
      },
    },
    {
      id: 'lead-capture',
      name: 'Newsletter Signup Quiz',
      description: 'Capture leads with an engaging quiz',
      category: 'lead-generation',
      tags: ['leads', 'newsletter', 'email'],
      template: {
        title: 'Get Personalized Tips & Offers',
        description: 'Answer 3 quick questions to receive tailored content',
        settings: {
          showProgress: true,
          allowBacktracking: false,
          showQuestionNumbers: false,
          requireAllQuestions: true,
          showResults: false,
          collectEmail: true,
          thankYouMessage: 'Welcome! Check your email for exclusive content.',
          redirectUrl: '/thank-you',
        },
        theme: {
          primaryColor: '#7C3AED',
          secondaryColor: '#EDE9FE',
          backgroundColor: '#FFFFFF',
          textColor: '#374151',
          fontFamily: 'Inter',
          fontSize: '16px',
          borderRadius: '12px',
          buttonStyle: 'pill',
          layout: 'single-column',
          animation: 'fade',
        },
        questions: [
          {
            order: 1,
            type: QuestionType.SINGLE_CHOICE,
            text: 'What are you most interested in?',
            description: 'This helps us send you relevant content',
            required: true,
            options: [
              { text: 'Product updates and new releases', value: 'products', tags: ['product-updates'] },
              { text: 'Industry tips and best practices', value: 'tips', tags: ['tips'] },
              { text: 'Exclusive deals and discounts', value: 'deals', tags: ['deals'] },
              { text: 'Company news and behind-the-scenes', value: 'news', tags: ['news'] },
            ],
          },
          {
            order: 2,
            type: QuestionType.SINGLE_CHOICE,
            text: 'How often would you like to hear from us?',
            description: 'We respect your inbox',
            required: true,
            options: [
              { text: 'Weekly', value: 'weekly' },
              { text: 'Bi-weekly', value: 'biweekly' },
              { text: 'Monthly', value: 'monthly' },
              { text: 'Only for special offers', value: 'special' },
            ],
          },
          {
            order: 3,
            type: QuestionType.TEXT,
            text: 'What\'s your email address?',
            description: 'We\'ll never share it with anyone else',
            required: true,
            settings: {
              placeholder: 'your@email.com',
            },
            validation: {
              required: true,
              pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
              message: 'Please enter a valid email address',
            },
          },
        ],
        logicRules: [
          {
            type: LogicRuleType.SEND_EMAIL,
            priority: 1,
            isActive: true,
            conditions: [
              {
                questionId: 'q1',
                operator: 'equals',
                value: 'deals',
              },
            ],
            actions: [
              {
                type: 'send_email',
                value: 'deals-welcome-sequence',
                message: 'Send deals welcome email sequence',
              },
            ],
          },
        ],
      },
    },
  ];

  /**
   * Get all template categories
   */
  getCategories(): TemplateCategory[] {
    return this.categories;
  }

  /**
   * Get all templates
   */
  getAllTemplates(): QuizTemplate[] {
    return this.templates;
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(categoryId: string): QuizTemplate[] {
    return this.templates.filter(template => template.category === categoryId);
  }

  /**
   * Get template by ID
   */
  getTemplateById(templateId: string): QuizTemplate {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }
    return template;
  }

  /**
   * Search templates by name or tags
   */
  searchTemplates(query: string): QuizTemplate[] {
    const searchTerm = query.toLowerCase();
    return this.templates.filter(template => 
      template.name.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Get question templates by type
   */
  getQuestionTemplates(type: QuestionType): QuestionBuilderData[] {
    const templates: Record<QuestionType, QuestionBuilderData[]> = {
      [QuestionType.SINGLE_CHOICE]: [
        {
          order: 1,
          type: QuestionType.SINGLE_CHOICE,
          text: 'What is your preferred option?',
          required: true,
          options: [
            { text: 'Option A', value: 'a' },
            { text: 'Option B', value: 'b' },
            { text: 'Option C', value: 'c' },
          ],
        },
        {
          order: 1,
          type: QuestionType.SINGLE_CHOICE,
          text: 'How would you rate your experience?',
          required: true,
          options: [
            { text: 'Excellent', value: 'excellent', score: 5 },
            { text: 'Good', value: 'good', score: 4 },
            { text: 'Average', value: 'average', score: 3 },
            { text: 'Poor', value: 'poor', score: 2 },
            { text: 'Very Poor', value: 'very-poor', score: 1 },
          ],
        },
      ],
      [QuestionType.MULTIPLE_CHOICE]: [
        {
          order: 1,
          type: QuestionType.MULTIPLE_CHOICE,
          text: 'Which features are most important to you?',
          description: 'Select all that apply',
          required: true,
          options: [
            { text: 'Easy to use', value: 'ease-of-use' },
            { text: 'Affordable price', value: 'price' },
            { text: 'High quality', value: 'quality' },
            { text: 'Fast delivery', value: 'delivery' },
            { text: 'Good customer service', value: 'service' },
          ],
          settings: {
            allowMultiple: true,
            minSelections: 1,
            maxSelections: 3,
          },
        },
      ],
      [QuestionType.TEXT]: [
        {
          order: 1,
          type: QuestionType.TEXT,
          text: 'Please share your thoughts',
          description: 'Your feedback is valuable to us',
          required: false,
          settings: {
            placeholder: 'Type your answer here...',
            maxLength: 500,
          },
        },
        {
          order: 1,
          type: QuestionType.TEXT,
          text: 'What is your email address?',
          required: true,
          settings: {
            placeholder: 'your@email.com',
          },
          validation: {
            required: true,
            pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
            message: 'Please enter a valid email address',
          },
        },
      ],
      [QuestionType.RATING]: [
        {
          order: 1,
          type: QuestionType.RATING,
          text: 'How would you rate this?',
          description: 'Rate from 1 to 5',
          required: true,
          settings: {
            minValue: 1,
            maxValue: 5,
            step: 1,
          },
        },
        {
          order: 1,
          type: QuestionType.RATING,
          text: 'How likely are you to recommend us?',
          description: 'Rate from 0 (not likely) to 10 (very likely)',
          required: true,
          settings: {
            minValue: 0,
            maxValue: 10,
            step: 1,
          },
        },
      ],
      [QuestionType.IMAGE_CHOICE]: [
        {
          order: 1,
          type: QuestionType.IMAGE_CHOICE,
          text: 'Which style do you prefer?',
          description: 'Select the option that appeals to you most',
          required: true,
          options: [
            { text: 'Modern', value: 'modern', image: '/images/modern.jpg' },
            { text: 'Classic', value: 'classic', image: '/images/classic.jpg' },
            { text: 'Vintage', value: 'vintage', image: '/images/vintage.jpg' },
          ],
        },
      ],
      [QuestionType.BOOLEAN]: [
        {
          order: 1,
          type: QuestionType.BOOLEAN,
          text: 'Do you agree with this statement?',
          required: true,
          options: [
            { text: 'Yes', value: 'true' },
            { text: 'No', value: 'false' },
          ],
        },
        {
          order: 1,
          type: QuestionType.BOOLEAN,
          text: 'Would you like to receive our newsletter?',
          required: false,
          options: [
            { text: 'Yes, keep me updated', value: 'true' },
            { text: 'No, thanks', value: 'false' },
          ],
        },
      ],
    };

    return templates[type] || [];
  }

  /**
   * Get logic rule templates
   */
  getLogicRuleTemplates(): LogicRuleBuilderData[] {
    return [
      {
        type: LogicRuleType.JUMP_TO_QUESTION,
        priority: 1,
        isActive: true,
        conditions: [
          {
            questionId: 'question-1',
            operator: 'equals',
            value: 'option-a',
          },
        ],
        actions: [
          {
            type: 'jump_to_question',
            targetId: 'question-3',
          },
        ],
      },
      {
        type: LogicRuleType.SHOW_QUESTION,
        priority: 1,
        isActive: true,
        conditions: [
          {
            questionId: 'question-1',
            operator: 'equals',
            value: 'yes',
          },
        ],
        actions: [
          {
            type: 'show_question',
            targetId: 'question-2',
          },
        ],
      },
      {
        type: LogicRuleType.ADD_TO_CART,
        priority: 1,
        isActive: true,
        conditions: [
          {
            questionId: 'product-preference',
            operator: 'equals',
            value: 'premium',
          },
        ],
        actions: [
          {
            type: 'add_to_cart',
            value: 'premium-product-id',
          },
        ],
      },
      {
        type: LogicRuleType.SEND_EMAIL,
        priority: 1,
        isActive: true,
        conditions: [
          {
            questionId: 'newsletter-signup',
            operator: 'equals',
            value: 'yes',
          },
        ],
        actions: [
          {
            type: 'send_email',
            value: 'welcome-email-template',
            message: 'Send welcome email to new subscriber',
          },
        ],
      },
    ];
  }

  /**
   * Create custom template from quiz
   */
  createCustomTemplate(
    quiz: QuizBuilderData,
    templateData: {
      name: string;
      description: string;
      category: string;
      tags: string[];
    }
  ): QuizTemplate {
    const customTemplate: QuizTemplate = {
      id: `custom-${Date.now()}`,
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      tags: templateData.tags,
      template: {
        ...quiz,
        // Remove IDs to make it a clean template
        id: undefined,
        questions: quiz.questions.map(q => ({ ...q, id: undefined })),
        logicRules: quiz.logicRules.map(r => ({ ...r, id: undefined })),
      },
    };

    this.logger.log(`Created custom template: ${customTemplate.name}`);
    return customTemplate;
  }
}
