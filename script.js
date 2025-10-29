(function(){
    const display = document.getElementById('display');
    const buttons = document.querySelectorAll('#calc .btn');

    let expr = '';
    let lastPressed = null;

    function updateDisplay(){
      display.textContent = expr === '' ? '0' : expr;
    }

    function isOperator(ch){
      return ['+','-','×','÷'].includes(ch);
    }

    function appendNumber(n){
      if(lastPressed === 'eq') expr = '';
      const lastToken = getLastToken();
      if(lastToken === '0' && n === '0') return;
      if(lastToken === '0' && !lastToken.includes('.') && !isOperator(expr.slice(-1))){
        expr = expr.slice(0, expr.length - 1) + n;
      } else {
        expr += n;
      }
      lastPressed = 'num';
      updateDisplay();
    }

    function appendDecimal(){
      if(lastPressed === 'eq') expr = '';
      const lastToken = getLastToken();
      if(lastToken.includes('.')) return;
      if(lastToken === '' || isOperator(expr.slice(-1))){
        expr += '0.';
      } else {
        expr += '.';
      }
      lastPressed = 'num';
      updateDisplay();
    }

    function appendOperator(op){
      if(expr === '' && op === '-'){
        expr = '-';
        lastPressed = 'op';
        updateDisplay();
        return;
      }
      if(expr === '') return;
      const lastChar = expr.slice(-1);
      if(isOperator(lastChar)){
        expr = expr.slice(0, -1) + op;
      } else {
        expr += op;
      }
      lastPressed = 'op';
      updateDisplay();
    }

    function appendParenthesis(p){
      if(lastPressed === 'eq') expr = '';
      const lastChar = expr.slice(-1);
      if(p === '('){
        // insert implicit multiplication before '('
        if(/[0-9)]$/.test(lastChar)) expr += '×';
        expr += '(';
      } else {
        // prevent unmatched ')'
        const open = (expr.match(/\(/g) || []).length;
        const close = (expr.match(/\)/g) || []).length;
        if(open > close && !isOperator(lastChar) && lastChar !== '('){
          expr += ')';
        }
      }
      lastPressed = 'num';
      updateDisplay();
    }

    function getLastToken(){
      let token = '';
      for(let i = expr.length - 1; i >= 0; i--){
        const ch = expr[i];
        if(isOperator(ch) || ch==='(' || ch===')') break;
        token = ch + token;
      }
      return token;
    }

    function clearAll(){ expr = ''; lastPressed = null; updateDisplay(); }

    function evaluateExpr(){
      if(expr === '') return;
      if(isOperator(expr.slice(-1))) expr = expr.slice(0, -1);
      const jsExpr = expr.replace(/×/g,'*').replace(/÷/g,'/');
      try{
        const result = Function('return (' + jsExpr + ')')();
        let displayVal = (typeof result === 'number' && !Number.isInteger(result)) ? parseFloat(result.toPrecision(12)) : result;
        expr = String(displayVal);
        lastPressed = 'eq';
        updateDisplay();
      }catch(e){
        expr = 'Error';
        lastPressed = 'eq';
        updateDisplay();
      }
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const txt = btn.textContent.trim();
        if(txt >= '0' && txt <= '9') return appendNumber(txt);
        if(txt === '.') return appendDecimal();
        if(txt === 'AC') return clearAll();
        if(txt === '=') return evaluateExpr();
        if(txt === '(' || txt === ')') return appendParenthesis(txt);
        return appendOperator(txt);
      });
    });

    window.addEventListener('keydown', (e) => {
      if(e.key >= '0' && e.key <= '9'){ appendNumber(e.key); e.preventDefault(); return; }
      if(e.key === '.') { appendDecimal(); e.preventDefault(); return; }
      if(e.key === '(' || e.key === ')'){ appendParenthesis(e.key); e.preventDefault(); return; }
      if(e.key === 'Enter' || e.key === '='){ evaluateExpr(); e.preventDefault(); return; }
      if(e.key === 'Backspace'){ expr = expr.slice(0, -1); updateDisplay(); e.preventDefault(); return; }
      if(['+','-','*','/'].includes(e.key)){
        const map = {'*':'×','/':'÷'};
        appendOperator(map[e.key] || e.key);
        e.preventDefault();
        return;
      }
      if(e.key.toLowerCase() === 'c'){ clearAll(); }
    });

    updateDisplay();
  })();