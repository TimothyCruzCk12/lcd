import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Calculator, Lightbulb, BookOpen, RefreshCw, Check, SkipForward, ArrowRight } from 'lucide-react';

const LCD = () => {
  const [inputNum1, setInputNum1] = useState('');
  const [inputNum2, setInputNum2] = useState('');
  const [displayNum1, setDisplayNum1] = useState('');
  const [displayNum2, setDisplayNum2] = useState('');
  const [lcd, setLCD] = useState(null);
  const [steps, setSteps] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userInputFactors, setUserInputFactors] = useState({ num1: [], num2: [] });
  const [factorInputStatus, setFactorInputStatus] = useState({ num1: [], num2: [] });
  const [currentFactorInput, setCurrentFactorInput] = useState('');
  const [activeNumber, setActiveNumber] = useState('num1');
  const [userLCDInput, setUserLCDInput] = useState('');
  const [isLCDCorrect, setIsLCDCorrect] = useState(null);

  const MIN_VALUE = 1;
  const MAX_VALUE = 1000;

  const clampValue = (value) => {
    const num = parseInt(value);
    if (isNaN(num)) return '';
    return Math.max(MIN_VALUE, Math.min(MAX_VALUE, num)).toString();
  };

  const handleInputChange = (setter) => (e) => {
    const rawValue = e.target.value;
    const clampedValue = clampValue(rawValue);
    setter(clampedValue);
  };

  const generateRandomNumber = () => {
    return Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE;
  };

  const handleRandomize = () => {
    const randomNum1 = generateRandomNumber();
    const randomNum2 = generateRandomNumber();
    setInputNum1(randomNum1.toString());
    setInputNum2(randomNum2.toString());
  };

  const getPrimeFactors = (num) => {
    let factors = [];
    let divisor = 2;
    while (num > 1) {
      if (num % divisor === 0) {
        factors.push(divisor);
        num /= divisor;
      } else {
        divisor++;
      }
    }
    return factors;
  };

  const calculateLCD = () => {
    const a = parseInt(inputNum1);
    const b = parseInt(inputNum2);

    if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) {
      alert('Please enter valid positive integers.');
      return;
    }

    setIsCalculating(true);
    setDisplayNum1(a.toString());
    setDisplayNum2(b.toString());

    const factorsA = getPrimeFactors(a);
    const factorsB = getPrimeFactors(b);

    setSteps([
      { title: `Step 1: Find the prime factors of ${a} and ${b}`, factorsA, factorsB },
      { title: `Step 2: Identify the highest power of each prime factor` },
      { title: `Step 3: Multiply these factors to get the LCD` },
    ]);

    setUserInputFactors({ num1: [], num2: [] });
    setFactorInputStatus({ num1: [], num2: [] });
    setCurrentStepIndex(0);
    setActiveNumber('num1');
    setIsCalculating(false);
  };

  const handleFactorInputChange = (e) => {
    setCurrentFactorInput(e.target.value);
  };

  const checkFactor = () => {
    const inputFactor = parseInt(currentFactorInput);
    if (isNaN(inputFactor)) return;

    const currentFactors = steps[0][activeNumber === 'num1' ? 'factorsA' : 'factorsB'];
    const userFactors = userInputFactors[activeNumber];

    if (inputFactor === currentFactors[userFactors.length]) {
      const newUserInputFactors = { ...userInputFactors };
      newUserInputFactors[activeNumber] = [...userFactors, inputFactor];
      setUserInputFactors(newUserInputFactors);

      const newFactorInputStatus = { ...factorInputStatus };
      newFactorInputStatus[activeNumber] = [...factorInputStatus[activeNumber], 'correct'];
      setFactorInputStatus(newFactorInputStatus);

      setCurrentFactorInput('');

      if (newUserInputFactors[activeNumber].length === currentFactors.length) {
        moveToNextFactorizationStep();
      }
    } else {
      const newFactorInputStatus = { ...factorInputStatus };
      newFactorInputStatus[activeNumber] = [...factorInputStatus[activeNumber], 'incorrect'];
      setFactorInputStatus(newFactorInputStatus);
    }
  };

  const skipFactor = () => {
    const currentFactors = steps[0][activeNumber === 'num1' ? 'factorsA' : 'factorsB'];
    const userFactors = userInputFactors[activeNumber];

    const newUserInputFactors = { ...userInputFactors };
    newUserInputFactors[activeNumber] = [...userFactors, currentFactors[userFactors.length]];
    setUserInputFactors(newUserInputFactors);

    const newFactorInputStatus = { ...factorInputStatus };
    newFactorInputStatus[activeNumber] = [...factorInputStatus[activeNumber], 'skipped'];
    setFactorInputStatus(newFactorInputStatus);

    setCurrentFactorInput('');

    if (newUserInputFactors[activeNumber].length === currentFactors.length) {
      moveToNextFactorizationStep();
    }
  };

  const moveToNextFactorizationStep = () => {
    if (activeNumber === 'num1') {
      setActiveNumber('num2');
    } else {
      setCurrentStepIndex(1);
      proceedToNextSteps();
    }
  };

  const proceedToNextSteps = () => {
    const factorsA = steps[0].factorsA;
    const factorsB = steps[0].factorsB;

    let lcdFactors = {};
    [...new Set([...factorsA, ...factorsB])].forEach(factor => {
      const countA = factorsA.filter(f => f === factor).length;
      const countB = factorsB.filter(f => f === factor).length;
      lcdFactors[factor] = Math.max(countA, countB);
    });

    let result = 1;
    Object.entries(lcdFactors).forEach(([factor, power]) => {
      result *= Math.pow(parseInt(factor), power);
    });

    setSteps(prevSteps => [
      prevSteps[0],
      { 
        title: `Step 2: Identify the highest power of each prime factor`,
        details: `Highest powers: ${Object.entries(lcdFactors).map(([factor, power]) => 
          power > 1 ? `${factor}^${power}` : factor).join(' × ')}`
      },
      {
        title: `Step 3: Multiply these factors to get the LCD`,
        details: `LCD = ${Object.entries(lcdFactors).map(([factor, power]) => 
          power > 1 ? `${factor}^${power}` : factor).join(' × ')}`
      },
    ]);

    setLCD(result);
  };

  const moveToNextStep = () => {
    if (currentStepIndex < 2) {
      setCurrentStepIndex(prevIndex => prevIndex + 1);
    }
  };

  const handleUserLCDInputChange = (e) => {
    setUserLCDInput(e.target.value);
  };

  const checkUserLCD = () => {
    const userLCD = parseInt(userLCDInput);
    if (userLCD === lcd) {
      setIsLCDCorrect(true);
      setCurrentStepIndex(3); // Move to result display
    } else {
      setIsLCDCorrect(false);
    }
  };

  const skipLCDCalculation = () => {
    setIsLCDCorrect(null);
    setCurrentStepIndex(3); // Move to result display
  };

  const getInputClassName = (status) => {
    let baseClass = "px-2 py-1 rounded text-xs";
    switch (status) {
      case 'correct':
        return `${baseClass} bg-green-100 text-green-800 border-green-500`;
      case 'incorrect':
        return `${baseClass} bg-red-100 text-red-800 border-red-500`;
      case 'skipped':
        return `${baseClass} bg-yellow-100 text-yellow-800 border-yellow-500`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800 border-gray-300`;
    }
  };

  const renderFactorization = (number, factors, userFactors, inputStatuses) => (
    <div className="mb-4">
      <p className="font-medium">Prime factors of {number}:</p>
      <div className="flex flex-wrap gap-2 mt-2">
        {factors.map((factor, idx) => (
          <span key={idx} className={getInputClassName(inputStatuses[idx])}>
            {userFactors[idx] || '?'}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-100 p-8 min-h-screen">
      <Card className="w-full max-w-2xl mx-auto shadow-md bg-white">
        <CardHeader className="bg-sky-100 text-sky-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold">LCD Explorer</CardTitle>
            <Calculator size={40} className="text-sky-600" />
          </div>
          <CardDescription className="text-sky-700 text-lg">Discover the Least Common Denominator!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <Alert className="bg-blue-50 border-blue-100">
            <Lightbulb className="h-4 w-4 text-blue-400" />
            <AlertTitle className="text-blue-700">What is the Least Common Denominator (LCD)?</AlertTitle>
            <AlertDescription className="text-blue-600">
              The LCD is the smallest positive number that is divisible by the denominators of two or more fractions. It's useful for adding and subtracting fractions with different denominators!
            </AlertDescription>
          </Alert>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <div className="flex-grow flex space-x-2">
                  <Input
                    type="number"
                    value={inputNum1}
                    onChange={handleInputChange(setInputNum1)}
                    placeholder="First number"
                    className="w-1/2 text-lg border-sky-200 focus:border-sky-400"
                  />
                  <Input
                    type="number"
                    value={inputNum2}
                    onChange={handleInputChange(setInputNum2)}
                    placeholder="Second number"
                    className="w-1/2 text-lg border-sky-200 focus:border-sky-400"
                  />
                </div>
                <Button onClick={handleRandomize} className="flex items-center bg-sky-500 hover:bg-sky-600 text-white whitespace-nowrap">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Random
                </Button>
              </div>
              <p className="text-sm text-gray-500 text-center">
                Enter numbers between {MIN_VALUE} and {MAX_VALUE}
              </p>
            </div>
            <Button 
              onClick={calculateLCD} 
              className="w-full bg-emerald-400 hover:bg-emerald-500 text-white text-xl py-6"
              disabled={isCalculating}
            >
              {isCalculating ? 'Calculating...' : 'Find LCD'}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start bg-gray-50">
          {steps.length > 0 && (
            <div className="w-full space-y-4">
              <p className="font-semibold text-purple-600">Steps to find LCD:</p>
              {steps.map((step, index) => (
                <div key={index} className={`bg-purple-50 p-4 rounded ${index > currentStepIndex ? 'opacity-50' : ''}`}>
                  <p className="font-medium mb-2">{step.title}</p>
                  {index === 0 && (
                    <>
                      {renderFactorization(displayNum1, step.factorsA, userInputFactors.num1, factorInputStatus.num1)}
                      {renderFactorization(displayNum2, step.factorsB, userInputFactors.num2, factorInputStatus.num2)}
                      {currentStepIndex === 0 && (
                        <div className="space-y-2">
                          <p>Enter the prime factors for {activeNumber === 'num1' ? displayNum1 : displayNum2}:</p>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={currentFactorInput}
                              onChange={handleFactorInputChange}
                              placeholder="Enter prime factor"
                              className="w-32"
                            />
                            <Button onClick={checkFactor} className="bg-blue-400 hover:bg-blue-500 flex items-center">
                              <Check className="mr-1 h-4 w-4" />
                              Check
                            </Button>
                            <Button onClick={skipFactor} className="bg-yellow-400 hover:bg-yellow-500 flex items-center">
                              <SkipForward className="mr-1 h-4 w-4" />
                              Skip
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {index > 0 && step.details && <p>{step.details}</p>}
                  {index === 1 && currentStepIndex === 1 && (
                    <Button 
                      onClick={moveToNextStep} 
                      className="mt-2 bg-purple-400 hover:bg-purple-500 text-white"
                    >
                      Move to Step 3 <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                  {index === 2 && currentStepIndex === 2 && (
                    <div className="mt-2 space-y-2">
                      <Input
                        type="number"
                        value={userLCDInput}
                        onChange={handleUserLCDInputChange}
                        placeholder="Enter your LCD calculation"
                        className="w-full"
                      />
                      <div className="flex space-x-2">
                        <Button 
                          onClick={checkUserLCD} 
                          className="bg-blue-400 hover:bg-blue-500 text-white"
                        >
                          Check LCD
                        </Button>
                        <Button 
                          onClick={skipLCDCalculation} 
                          className="bg-yellow-400 hover:bg-yellow-500 text-white"
                        >
                          Skip
                        </Button>
                      </div>
                      {isLCDCorrect === false && (
                        <p className="text-red-500">That's not correct. Try again or skip to see the answer.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {currentStepIndex === 3 && (
                <Alert className="mt-4 bg-emerald-50 border-emerald-200">
                  <AlertTitle className="text-emerald-700 text-xl">Result</AlertTitle>
                  <AlertDescription className="text-emerald-600 text-lg">
                    The LCD of {displayNum1} and {displayNum2} is <span className="font-bold">{lcd}</span>.
                    {isLCDCorrect === true && (
                      <p className="text-green-500 mt-2">Great job! Your calculation was correct.</p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
      <div className="mt-4 text-center text-gray-700">
        <p className="flex items-center justify-center">
          <BookOpen className="mr-2 text-gray-600" />
          LCD is used in real life for adding and subtracting fractions, like when combining ingredients in recipes or calculating precise measurements in science experiments!
        </p>
      </div>
    </div>
  );
};

export default LCD;