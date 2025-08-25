class TokenPipeline {
    constructor(container, attentionHeads, orchestrationManager, computationComparison ) {
        this.container = container;
        this.attentionHeads = attentionHeads;
        this.orchestrationManager = orchestrationManager;
        this.computationComparison = computationComparison
        this.tokens = [];
        this.currentPosition = 0;
        this.isProcessing = false;
        this.processingSpeed = 1000;
        
        this.initializeDOM();
        this.setupControls();
    }
    
    initializeDOM() {
        this.container.innerHTML = `
            <div class="token-pipeline">
                <div class="pipeline-header">
                    <h3>Token Pipeline</h3>
                    <div class="pipeline-controls">
                        <select id="orchestration-select">
                            <option value="basic">Basic</option>
                            <option value="self-attention">Self-Attention</option>
                            <option value="cross-head">Cross-Head Communication</option>
                            <option value="shared-cache">Shared Cache</option>
                            <option value="dynamic">Dynamic Allocation</option>
                            <option value="hierarchical">Hierarchical</option>
                        </select>
                        <div id="orchestration-explanation" class="orchestration-explanation">
                            Select an orchestration pattern to see how attention heads coordinate.
                        </div>
                        <input type="text" id="token-input" placeholder="Enter text to process..." />
                        <button id="process-btn">Process</button>
                        <button id="step-btn">Step</button>
                        <button id="reset-btn">Reset</button>
                        <button id="pause-btn">Pause</button>
                    </div>
                </div>
                <div class="token-flow">
                    <div class="input-tokens"></div>
                    <div class="current-token"></div>
                    <div class="processed-tokens"></div>
                </div>
                <div class="pipeline-status">
                    <span id="status-text">Ready</span>
                    <span id="position-counter">Position: 0</span>
                </div>
            </div>
        `;
    }
    
    setupControls() {
        const orchestrationSelect = this.container.querySelector('#orchestration-select');
        const processBtn = this.container.querySelector('#process-btn');
        const stepBtn = this.container.querySelector('#step-btn');
        const resetBtn = this.container.querySelector('#reset-btn');
        const pauseBtn = this.container.querySelector('#pause-btn');
        const tokenInput = this.container.querySelector('#token-input');
        
        orchestrationSelect.addEventListener('change', (e) => {
            this.orchestrationManager.setStrategy(e.target.value);
            this.updateStatus(`Switched to ${e.target.value} orchestration`);
            this.updateOrchestrationExplanation(e.target.value); // New line
        });
        
        processBtn.addEventListener('click', () => this.processInput());
        //stepBtn.addEventListener('click', () => this.processNextToken());
        stepBtn.addEventListener('click', () => {
            // Check if we need to tokenize first
            if (this.tokens.length === 0) {
                const input = this.container.querySelector('#token-input').value.trim();
                if (!input) return;
                
                this.tokens = this.tokenize(input);
                this.currentPosition = 0;
                this.visualizeTokens();
                this.updateStatus('Ready to step through tokens...');
            }
            
            this.processNextToken();
        });

        resetBtn.addEventListener('click', () => this.reset());
        pauseBtn.addEventListener('click', () => this.togglePause());
        
        tokenInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.processInput();
        });
    }

    // Add this new method to the TokenPipeline class
    updateOrchestrationExplanation(strategy) {
        const explanations = {
            'basic': 'Each attention head works independently without sharing information.',
            'cross-head': 'Heads communicate and share attention patterns with each other.',
            'shared-cache': 'Heads share a common cache to reduce memory usage.',
            'dynamic': 'Resources are allocated dynamically based on input complexity.',
            'hierarchical': 'Heads process tokens in layers with dependencies.'
        };
        
        const explanationBox = this.container.querySelector('#orchestration-explanation');
        explanationBox.textContent = explanations[strategy] || 'Select a pattern to see explanation.';
    }
    
    processInput() {
        const input = this.container.querySelector('#token-input').value.trim();
        const selectedMode = this.container.querySelector('#orchestration-select').value;

        if (!input) return;
        
        this.tokens = this.tokenize(input);
        this.currentPosition = 0;
        this.isProcessing = true;
        
        this.updateStatus('Processing tokens...');
        this.visualizeTokens();
        //this.computationComparison.startComparison(this.tokens);
        this.computationComparison.startComparison(this.tokens, selectedMode);

        this.startProcessing();
    }
    
    tokenize(text) {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, ' $& ')
            .split(/\s+/)
            .filter(token => token.trim().length > 0);
    }
    
    startProcessing() {
        if (!this.isProcessing || this.currentPosition >= this.tokens.length) {
            this.updateStatus('Processing complete');
            this.isProcessing = false;
            return;
        }
        
        this.processNextToken();
        
        setTimeout(() => {
            this.startProcessing();
        }, this.processingSpeed);
    }
    
    processNextToken() {
        if (this.currentPosition >= this.tokens.length) {
            this.updateStatus('All tokens processed');
            this.isProcessing = false;
            return;
        }
        
        const currentToken = this.tokens[this.currentPosition];
        
        this.highlightCurrentToken(currentToken);
        
        // Use orchestration manager
        this.orchestrationManager.processToken(currentToken, this.currentPosition);
        this.orchestrationManager.computeAttention(currentToken);
        
        this.moveTokenToProcessed(currentToken);
        
        this.currentPosition++;
        this.updatePositionCounter();
        
        if (this.currentPosition >= this.tokens.length) {
            this.updateStatus('Processing complete');
            this.isProcessing = false;
        }
    }
    
    visualizeTokens() {
        const inputContainer = this.container.querySelector('.input-tokens');
        const processedContainer = this.container.querySelector('.processed-tokens');
        
        inputContainer.innerHTML = '<h4>Input Queue</h4>';
        processedContainer.innerHTML = '<h4>Processed</h4>';
        
        this.tokens.forEach((token, index) => {
            const tokenElement = document.createElement('div');
            tokenElement.className = 'token-item input-token';
            tokenElement.textContent = token;
            tokenElement.dataset.index = index;
            inputContainer.appendChild(tokenElement);
        });
    }
    
    highlightCurrentToken(token) {
        const currentContainer = this.container.querySelector('.current-token');
        currentContainer.innerHTML = `
            <h4>Processing</h4>
            <div class="token-item current-processing">${token}</div>
        `;
        
        const inputTokens = this.container.querySelectorAll('.input-token');
        inputTokens.forEach((el, index) => {
            el.classList.toggle('active', index === this.currentPosition);
        });
    }
    
    moveTokenToProcessed(token) {
        const processedContainer = this.container.querySelector('.processed-tokens');
        
        setTimeout(() => {
            const tokenElement = document.createElement('div');
            tokenElement.className = 'token-item processed-token';
            tokenElement.textContent = token;
            processedContainer.appendChild(tokenElement);
            
            this.container.querySelector('.current-token').innerHTML = '<h4>Processing</h4>';
        }, 500);
    }
    
    togglePause() {
        this.isProcessing = !this.isProcessing;
        const pauseBtn = this.container.querySelector('#pause-btn');
        
        if (this.isProcessing) {
            pauseBtn.textContent = 'Pause';
            this.updateStatus('Processing resumed...');
            this.startProcessing();
        } else {
            pauseBtn.textContent = 'Resume';
            this.updateStatus('Processing paused');
        }
    }
    
    reset() {
        this.tokens = [];
        this.currentPosition = 0;
        this.isProcessing = false;
        
        this.container.querySelector('.input-tokens').innerHTML = '<h4>Input Queue</h4>';
        this.container.querySelector('.current-token').innerHTML = '<h4>Processing</h4>';
        this.container.querySelector('.processed-tokens').innerHTML = '<h4>Processed</h4>';
        this.container.querySelector('#token-input').value = '';
        
        this.orchestrationManager.reset();
        
        this.updateStatus('Ready');
        this.updatePositionCounter();
        
        this.container.querySelector('#pause-btn').textContent = 'Pause';
    }
    
    updateStatus(message) {
        this.container.querySelector('#status-text').textContent = message;
    }
    
    updatePositionCounter() {
        this.container.querySelector('#position-counter').textContent = 
            `Position: ${this.currentPosition}/${this.tokens.length}`;
    }
    
    setProcessingSpeed(speed) {
        this.processingSpeed = speed;
    }
    
    setCustomTokenizer(tokenizerFunction) {
        this.customTokenizer = tokenizerFunction;
    }
    
    tokenizeWithCustom(text) {
        return this.customTokenizer ? this.customTokenizer(text) : this.tokenize(text);
    }
}

export default TokenPipeline;
