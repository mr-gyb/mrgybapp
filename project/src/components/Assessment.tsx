import React, { useState, useEffect, startTransition } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveAssessmentCompletion, getAssessmentCompletion, type AssessmentAnswers as ApiAssessmentAnswers } from '../lib/firebase/assessment';

interface AssessmentAnswers {
  legallyRegistered: string;
  definedProduct: string;
  monthlyRevenue: string;
  recurringCustomers: string;
  marketingBudget: string;
  automationTools: string;
  teamSize: string;
  revenueGrowth: string;
  multipleRegions: string;
  scalingProcesses: string;
}

const Assessment: React.FC = () => {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>({
    legallyRegistered: '',
    definedProduct: '',
    monthlyRevenue: '',
    recurringCustomers: '',
    marketingBudget: '',
    automationTools: '',
    teamSize: '',
    revenueGrowth: '',
    multipleRegions: '',
    scalingProcesses: ''
  });

  // Check if user has already completed the assessment
  useEffect(() => {
    const checkExistingCompletion = async () => {
      console.log('=== CHECKING ASSESSMENT COMPLETION FROM DATABASE ===');
      console.log('User:', user?.uid);
      
      if (!user) {
        console.log('No user found, allowing assessment to proceed');
        return;
      }

      try {
        // Check database for assessment completion
        const assessmentCompletion = await getAssessmentCompletion(user.uid);
        
        if (assessmentCompletion) {
          console.log('User has already completed assessment:', assessmentCompletion);
          
          // Redirect immediately to roadmap with appropriate parameters based on completed phases
          if (assessmentCompletion.foundationCompleted && assessmentCompletion.developmentCompleted) {
            console.log('Redirecting to roadmap with development completed');
            window.location.href = 'http://localhost:3002/roadmap?developmentCompleted=true';
          } else if (assessmentCompletion.foundationCompleted) {
            console.log('Redirecting to roadmap with foundation completed');
            window.location.href = 'http://localhost:3002/roadmap?foundationCompleted=true';
          } else {
            console.log('Redirecting to roadmap normally');
            window.location.href = 'http://localhost:3002/roadmap';
          }
          return;
        }
        
        console.log('No assessment completion found in database, allowing assessment to proceed');
      } catch (error) {
        console.error('Error checking assessment completion:', error);
        // On error, allow assessment to proceed
      }
    };

    // Check immediately when user is available
    if (user) {
      checkExistingCompletion();
    }
  }, [user]);

  // Also check on component mount for immediate redirect
  useEffect(() => {
    const immediateCheck = async () => {
      if (user) {
        try {
          const assessmentCompletion = await getAssessmentCompletion(user.uid);
          if (assessmentCompletion) {
            console.log('Immediate check: User has completed assessment, redirecting');
            if (assessmentCompletion.foundationCompleted && assessmentCompletion.developmentCompleted) {
              window.location.href = 'http://localhost:3002/roadmap?developmentCompleted=true';
            } else if (assessmentCompletion.foundationCompleted) {
              window.location.href = 'http://localhost:3002/roadmap?foundationCompleted=true';
            } else {
              window.location.href = 'http://localhost:3002/roadmap';
            }
          }
        } catch (error) {
          console.error('Error in immediate check:', error);
        }
      }
    };

    // Run immediate check
    immediateCheck();
  }, []); // Run only once on mount


  const questions = [
    {
      id: 'legallyRegistered',
      question: 'Is your business legally registered as a company?',
      type: 'yesno',
      options: ['Yes', 'No']
    },
    {
      id: 'definedProduct',
      question: 'Do you currently sell a clearly defined product or service?',
      type: 'yesno',
      options: ['Yes', 'No']
    },
    {
      id: 'monthlyRevenue',
      question: 'What is your average monthly revenue?',
      type: 'multiple',
      options: ['None yet', '<$5K', '$5K–$50K', '$50K–$100K', '$100K+']
    },
    {
      id: 'recurringCustomers',
      question: 'Do you have recurring customers or a customer retention strategy in place?',
      type: 'yesno',
      options: ['Yes', 'No']
    },
    {
      id: 'marketingBudget',
      question: 'Do you have a marketing or advertising budget?',
      type: 'yesno',
      options: ['Yes', 'No']
    },
    {
      id: 'automationTools',
      question: 'Do you use automation or analytics tools to track performance (e.g., CRM, analytics dashboards)?',
      type: 'yesno',
      options: ['Yes', 'No']
    },
    {
      id: 'teamSize',
      question: 'How large is your current team?',
      type: 'multiple',
      options: ['Solo/freelancer', '2–10 employees', '11–50 employees', '50+ employees']
    },
    {
      id: 'revenueGrowth',
      question: 'Has your revenue been steadily growing over the past 12 months?',
      type: 'yesno',
      options: ['Yes', 'No']
    },
    {
      id: 'multipleRegions',
      question: 'Are you operating in multiple regions or actively exploring new markets?',
      type: 'yesno',
      options: ['Yes', 'No']
    },
    {
      id: 'scalingProcesses',
      question: 'Do you have established processes for scaling (e.g., documented SOPs, hiring systems, partnerships)?',
      type: 'yesno',
      options: ['Yes', 'No']
    }
  ];

  const handleAnswer = (answer: string) => {
    const questionId = questions[currentQuestion].id as keyof AssessmentAnswers;
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      startTransition(() => {
        setCurrentQuestion(prev => prev + 1);
      });
    } else {
      // Calculate business stage based on answers
      const stage = calculateBusinessStage();
      console.log('Business Stage:', stage);
      console.log('Answers:', answers);
      // Show results on the same page
      startTransition(() => {
        setCurrentQuestion(questions.length); // Set to show results
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      startTransition(() => {
        setCurrentQuestion(prev => prev - 1);
      });
    }
  };


  const calculateBusinessStage = () => {
    // Foundation discriminators (strong indicators that override everything)
    if (answers.legallyRegistered === 'No') return 'Foundation';
    if (answers.definedProduct === 'No') return 'Foundation';
    if (answers.monthlyRevenue === 'None yet' || answers.monthlyRevenue === '<$5K') return 'Foundation';
    if (answers.teamSize === 'Solo/freelancer') return 'Foundation';

    // Growth discriminators (strong indicators that override development)
    if (answers.monthlyRevenue === '$100K+') return 'Growth';
    if (answers.teamSize === '11–50 employees' || answers.teamSize === '50+ employees') return 'Growth';
    if (answers.revenueGrowth === 'Yes') return 'Growth';
    if (answers.multipleRegions === 'Yes') return 'Growth';
    if (answers.scalingProcesses === 'Yes') return 'Growth';

    // Development phase indicators (if not foundation or growth)
    if (answers.monthlyRevenue === '$5K–$50K' || answers.monthlyRevenue === '$50K–$100K') return 'Development';
    if (answers.recurringCustomers === 'Yes') return 'Development';
    if (answers.marketingBudget === 'Yes') return 'Development';
    if (answers.automationTools === 'Yes') return 'Development';
    if (answers.teamSize === '2–10 employees') return 'Development';

    // Default to Foundation if no clear indicators
    return 'Foundation';
  };

  const businessStage = calculateBusinessStage();

  // Show results if assessment is complete
  if (currentQuestion >= questions.length) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#11335d',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        {/* Results Card */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '1rem',
          padding: '3rem',
          maxWidth: '600px',
          width: '100%',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center'
        }}>
          {/* Congratulations Message */}
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>
            🎉
          </div>
          
          <h1 style={{
            fontSize: '2.5rem',
            color: 'white',
            marginBottom: '1rem',
            fontFamily: 'serif',
            lineHeight: '1.2'
          }}>
            Congratulations!
          </h1>
          
          <p style={{
            fontSize: '1.5rem',
            color: '#e3c472',
            marginBottom: '2rem',
            fontFamily: 'sans-serif',
            fontWeight: '600'
          }}>
            You are in the <span style={{ textTransform: 'uppercase' }}>{businessStage}</span> phase
          </p>
          
          <p style={{
            fontSize: '1.1rem',
            color: 'white',
            marginBottom: '2rem',
            fontFamily: 'sans-serif',
            lineHeight: '1.5'
          }}>
            {businessStage === 'Foundation' && 
              "Focus on establishing your core business infrastructure, legal registration, and defining your products or services."
            }
            {businessStage === 'Development' && 
              "You're building and testing your core products/services. Focus on customer acquisition and process optimization."
            }
            {businessStage === 'Growth' && 
              "Time to scale! Focus on market expansion, team growth, and operational efficiency."
            }
          </p>
          
          <button
            onClick={async () => {
              console.log('=== ASSESSMENT COMPLETION BUTTON CLICKED ===');
              console.log('User:', user);
              console.log('Business Stage:', businessStage);
              console.log('Answers:', answers);
              
              // Save assessment completion to database
              if (user) {
                try {
                  await saveAssessmentCompletion(user.uid, businessStage, answers as ApiAssessmentAnswers);
                  console.log('Successfully saved assessment completion to database for user:', user.uid);
                } catch (error) {
                  console.error('Error saving assessment completion to database:', error);
                  // Still proceed with redirect even if save fails
                }
              } else {
                console.log('No user found, cannot save assessment state');
              }

              startTransition(() => {
                // For Development phase, redirect to roadmap with foundation phase completed
                if (businessStage === 'Development') {
                  window.location.href = 'http://localhost:3002/roadmap?foundationCompleted=true';
                } 
                // For Growth phase, redirect to roadmap with development phase completed
                else if (businessStage === 'Growth') {
                  window.location.href = 'http://localhost:3002/roadmap?developmentCompleted=true';
                } 
                // For Foundation phase, redirect normally
                else {
                  window.location.href = 'http://localhost:3002/roadmap';
                }
              });
            }}
            style={{
              backgroundColor: '#e3c472',
              color: '#11335d',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '0.5rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: 'sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#d4b85a';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#e3c472';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            View Your Roadmap
          </button>
        </div>
      </div>
    );
  }

  const currentAnswer = currentQuestion < questions.length ? answers[questions[currentQuestion].id as keyof AssessmentAnswers] : '';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#11335d',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      {/* Progress Bar */}
      <div style={{
        width: '100%',
        maxWidth: '600px',
        marginBottom: '2rem'
      }}>
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            height: '100%',
            backgroundColor: '#e3c472',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
        <p style={{
          color: 'white',
          textAlign: 'center',
          marginTop: '0.5rem',
          fontSize: '0.9rem'
        }}>
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>

      {/* Question Card */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '600px',
        width: '100%',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Question */}
        <h2 style={{
          fontSize: '1.5rem',
          color: 'white',
          marginBottom: '2rem',
          textAlign: 'center',
          fontFamily: 'serif',
          lineHeight: '1.4'
        }}>
          {questions[currentQuestion].question}
        </h2>

        {/* Answer Options */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              style={{
                padding: '1rem 1.5rem',
                backgroundColor: currentAnswer === option ? '#e3c472' : 'rgba(255, 255, 255, 0.1)',
                color: currentAnswer === option ? '#11335d' : 'white',
                border: `2px solid ${currentAnswer === option ? '#e3c472' : 'rgba(255, 255, 255, 0.3)'}`,
                borderRadius: '0.5rem',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                fontFamily: 'sans-serif'
              }}
              onMouseEnter={(e) => {
                if (currentAnswer !== option) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentAnswer !== option) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: currentQuestion === 0 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
              color: currentQuestion === 0 ? 'rgba(255, 255, 255, 0.5)' : 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'sans-serif'
            }}
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!currentAnswer}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: currentAnswer ? '#e3c472' : 'rgba(255, 255, 255, 0.1)',
              color: currentAnswer ? '#11335d' : 'rgba(255, 255, 255, 0.5)',
              border: `1px solid ${currentAnswer ? '#e3c472' : 'rgba(255, 255, 255, 0.3)'}`,
              borderRadius: '0.5rem',
              fontSize: '1rem',
              cursor: currentAnswer ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              fontFamily: 'sans-serif',
              fontWeight: '600'
            }}
          >
            {currentQuestion === questions.length - 1 ? 'Complete Assessment' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assessment;
