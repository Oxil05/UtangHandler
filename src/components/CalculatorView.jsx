import React, { useState } from 'react';
import { Calculator, ArrowRight, Delete, RotateCcw } from 'lucide-react';

export default function CalculatorView({ currencySymbol, onApplyToUtang }) {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');

  const handleInput = (char) => {
    setExpression((prev) => prev + char);
  };

  const handleClear = () => {
    setExpression('');
    setResult('0');
  };

  const handleBackspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleCalculate = () => {
    if (!expression) return;
    try {
      // Replace display operators with JS mathematical syntax
      const sanitized = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/%/g, '/100');
      
      // Safe numeric calculation
      const res = Function(`'use strict'; return (${sanitized})`)();
      if (typeof res === 'number' && !isNaN(res)) {
        const formatted = Number.isInteger(res) ? res.toString() : res.toFixed(2);
        setResult(formatted);
      } else {
        setResult('Error');
      }
    } catch (e) {
      setResult('Error');
    }
  };

  const handleUseResult = () => {
    const amountVal = parseFloat(result !== '0' && result !== 'Error' ? result : expression);
    if (!isNaN(amountVal) && amountVal > 0) {
      onApplyToUtang(amountVal);
    }
  };

  return (
    <div className="calculator-container glass-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calculator size={20} color="var(--brand-primary)" /> Mobile Calculator
        </h3>
        {result !== '0' && result !== 'Error' && (
          <button 
            className="action-chip primary" 
            style={{ padding: '6px 12px', fontSize: '0.82rem', minWidth: 'auto' }}
            onClick={handleUseResult}
          >
            Apply {currencySymbol}{result} <ArrowRight size={14} />
          </button>
        )}
      </div>

      <div className="calc-display">
        <div className="calc-expression">{expression || '0'}</div>
        <div className="calc-result">{currencySymbol} {result}</div>
      </div>

      <div className="calc-keypad">
        <button className="calc-btn action" onClick={handleClear}>C</button>
        <button className="calc-btn action" onClick={handleBackspace}><Delete size={18} /></button>
        <button className="calc-btn operator" onClick={() => handleInput('%')}>%</button>
        <button className="calc-btn operator" onClick={() => handleInput('÷')}>÷</button>

        <button className="calc-btn" onClick={() => handleInput('7')}>7</button>
        <button className="calc-btn" onClick={() => handleInput('8')}>8</button>
        <button className="calc-btn" onClick={() => handleInput('9')}>9</button>
        <button className="calc-btn operator" onClick={() => handleInput('×')}>×</button>

        <button className="calc-btn" onClick={() => handleInput('4')}>4</button>
        <button className="calc-btn" onClick={() => handleInput('5')}>5</button>
        <button className="calc-btn" onClick={() => handleInput('6')}>6</button>
        <button className="calc-btn operator" onClick={() => handleInput('-')}>-</button>

        <button className="calc-btn" onClick={() => handleInput('1')}>1</button>
        <button className="calc-btn" onClick={() => handleInput('2')}>2</button>
        <button className="calc-btn" onClick={() => handleInput('3')}>3</button>
        <button className="calc-btn operator" onClick={() => handleInput('+')}>+</button>

        <button className="calc-btn" onClick={() => handleInput('0')}>0</button>
        <button className="calc-btn" onClick={() => handleInput('00')}>00</button>
        <button className="calc-btn" onClick={() => handleInput('.')}>.</button>
        <button className="calc-btn equals" onClick={handleCalculate}>=</button>
      </div>
    </div>
  );
}
